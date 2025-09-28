import random
import math
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass
from deap import base, creator, tools, algorithms
from app.models.market import Market
from app.logging import get_logger
import requests

# matplotlib
import matplotlib.pyplot as plt

# use terminal backend for matplotlib
plt.switch_backend("Agg")
logger = get_logger(__name__)


@dataclass
class GAConfig:
    """Simplified GA configuration"""

    POPULATION_SIZE: int = 100
    GENERATIONS: int = 100
    CROSSOVER_PROB: float = 0.7
    MUTATION_PROB: float = 0.3
    TOURNAMENT_SIZE: int = 3
    ELITE_SIZE: int = 3


@dataclass
class GAStats:
    """Statistics for tracking GA convergence"""

    generation: int
    best_fitness: float
    worst_fitness: float
    avg_fitness: float
    std_fitness: float
    diversity: float
    stagnation_count: int


class MarketGA:
    """Compact GA service to find nearest markets with convergence tracking"""

    def __init__(self, target_lat: float, target_lng: float):
        self.target_lat = target_lat
        self.target_lng = target_lng
        self.markets = []
        self.toolbox = None
        self._distance_cache = {}
        self.target_count = None  # Will be set when running GA

        # Tracking variables
        self.stats_history = []
        self.best_fitness_history = []
        self.avg_fitness_history = []
        self.diversity_history = []
        self.stagnation_count = 0
        self.last_best_fitness = float("inf")

        self._setup_deap()

    def _setup_deap(self):
        """Setup DEAP toolbox"""
        try:
            if hasattr(creator, "FitnessMin"):
                del creator.FitnessMin
            if hasattr(creator, "Individual"):
                del creator.Individual
        except Exception:
            pass

        creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
        creator.create("Individual", list, fitness=creator.FitnessMin)

        self.toolbox = base.Toolbox()
        self.toolbox.register("individual", self._create_individual)
        self.toolbox.register("evaluate", self._evaluate_individual)
        self.toolbox.register("mate", self._crossover)
        self.toolbox.register("mutate", self._mutate_individual)
        self.toolbox.register(
            "select", tools.selTournament, tournsize=GAConfig.TOURNAMENT_SIZE
        )

    def _calculate_diversity(self, population: List[List[int]]) -> float:
        """Calculate population diversity using Hamming distance"""
        if len(population) < 2:
            return 0.0

        total_distance = 0
        comparisons = 0

        for i in range(len(population)):
            for j in range(i + 1, len(population)):
                # Hamming distance between two individuals
                hamming_dist = sum(a != b for a, b in zip(population[i], population[j]))
                total_distance += hamming_dist
                comparisons += 1

        # Normalize by maximum possible distance and number of comparisons
        max_distance = len(population[0])  # Maximum Hamming distance
        avg_distance = total_distance / comparisons if comparisons > 0 else 0
        return avg_distance / max_distance

    def _collect_stats(self, population: List, generation: int) -> GAStats:
        """Collect statistics for current generation"""
        # Get fitness values
        fitness_values = [
            ind.fitness.values[0] for ind in population if ind.fitness.valid
        ]

        if not fitness_values:
            return GAStats(
                generation,
                float("inf"),
                float("inf"),
                float("inf"),
                0.0,
                0.0,
                self.stagnation_count,
            )

        best_fitness = min(fitness_values)
        worst_fitness = max(fitness_values)
        avg_fitness = np.mean(fitness_values)
        std_fitness = np.std(fitness_values)

        # Calculate diversity
        diversity = self._calculate_diversity(population)

        # Update stagnation count
        if (
            abs(best_fitness - self.last_best_fitness) < 0.001
        ):  # Threshold for "no improvement"
            self.stagnation_count += 1
        else:
            self.stagnation_count = 0
            self.last_best_fitness = best_fitness

        return GAStats(
            generation=generation,
            best_fitness=best_fitness,
            worst_fitness=worst_fitness,
            avg_fitness=avg_fitness,
            std_fitness=std_fitness,
            diversity=diversity,
            stagnation_count=self.stagnation_count,
        )

    def _log_generation_stats(self, stats: GAStats):
        """Log generation statistics"""
        logger.info(f"Generation {stats.generation}:")
        logger.info(f"  Best Fitness: {stats.best_fitness:.4f}")
        logger.info(f"  Avg Fitness: {stats.avg_fitness:.4f}")
        logger.info(f"  Worst Fitness: {stats.worst_fitness:.4f}")
        logger.info(f"  Std Fitness: {stats.std_fitness:.4f}")
        logger.info(f"  Diversity: {stats.diversity:.4f}")
        logger.info(f"  Stagnation: {stats.stagnation_count} generations")

        # Store for history
        self.best_fitness_history.append(stats.best_fitness)
        self.avg_fitness_history.append(stats.avg_fitness)
        self.diversity_history.append(stats.diversity)
        self.stats_history.append(stats)

    # @lru_cache(maxsize=256)
    def _get_route_distance(
        self, start: Tuple[float, float], end: Tuple[float, float]
    ) -> Optional[float]:
        """Get route distance from OSRM API"""
        lng1, lat1 = start[1], start[0]
        lng2, lat2 = end[1], end[0]
        url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false"
        try:
            response = requests.get(url, timeout=3)
            data = response.json()
            return data["routes"][0]["distance"] / 1000  # km
        except Exception:
            return None

    def _haversine_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """Calculate Haversine distance between two points"""
        cache_key = (lat1, lng1, lat2, lng2)
        if cache_key in self._distance_cache:
            return self._distance_cache[cache_key]

        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        dlat, dlng = lat2 - lat1, lng2 - lng1
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        distance = 6371 * c  # Earth radius in kilometers

        self._distance_cache[cache_key] = distance
        return distance

    def _create_individual(self) -> List[int]:
        """Create random individual (binary representation of selected markets)"""
        individual = [0] * len(self.markets)

        # Use self.target_count if set, otherwise select 2-5 markets randomly
        if self.target_count:
            num_select = min(self.target_count, len(self.markets))
        else:
            num_select = random.randint(2, min(5, len(self.markets)))

        selected_indices = random.sample(range(len(self.markets)), num_select)
        for idx in selected_indices:
            individual[idx] = 1
        return creator.Individual(individual)

    def _evaluate_individual(self, individual: List[int]) -> Tuple[float]:
        """Evaluate individual fitness based on average Haversine distance and count penalty"""
        selected_indices = [i for i, val in enumerate(individual) if val == 1]

        if not selected_indices:
            return (float("inf"),)

        # Calculate average Haversine distance
        distances = []
        for idx in selected_indices:
            market = self.markets[idx]
            distance = self._haversine_distance(
                self.target_lat, self.target_lng, market.latitude, market.longitude
            )
            if distance is None:  # Fallback to Haversine
                distance = self._haversine_distance(
                    self.target_lat, self.target_lng, market.latitude, market.longitude
                )
            distances.append(distance)

        avg_distance = sum(distances) / len(distances)

        # Add penalty for not matching target count
        count_penalty = 0
        if self.target_count:
            count_diff = abs(len(selected_indices) - self.target_count)
            count_penalty = count_diff * 100.0  # Heavy penalty for wrong count

        return (avg_distance + count_penalty,)

    def _mutate_individual(self, individual: List[int]) -> Tuple[List[int]]:
        """Mutate individual by flipping bits while maintaining target count"""
        current_count = sum(individual)
        for _ in range(random.randint(1, 3)):  # Perform 1-3 bit flips
            # Choose a 1 to flip to 0
            ones = [i for i, val in enumerate(individual) if val == 1]
            zeros = [i for i, val in enumerate(individual) if val == 0]
            if ones and zeros:
                flip_off = random.choice(ones)
                flip_on = random.choice(zeros)
                individual[flip_off] = 0
                individual[flip_on] = 1

        # Ensure exactly target_count markets are selected
        if self.target_count:
            while sum(individual) > self.target_count:
                ones = [i for i, val in enumerate(individual) if val == 1]
                if ones:
                    individual[random.choice(ones)] = 0
            while sum(individual) < self.target_count:
                zeros = [i for i, val in enumerate(individual) if val == 0]
                if zeros:
                    individual[random.choice(zeros)] = 1

        return (individual,)

    def _crossover(
        self, parent1: List[int], parent2: List[int]
    ) -> Tuple[List[int], List[int]]:
        """Single point crossover"""
        if len(parent1) < 2:
            return creator.Individual(parent1), creator.Individual(parent2)

        point = random.randint(1, len(parent1) - 1)
        child1 = creator.Individual(parent1[:point] + parent2[point:])
        child2 = creator.Individual(parent2[:point] + parent1[point:])
        return child1, child2

    def _run_ga(self, target_count: Optional[int] = None) -> List[int]:
        """Run genetic algorithm to find optimal market selection with detailed tracking"""
        if not self.markets:
            return []

        # Reset tracking variables
        self.stats_history = []
        self.best_fitness_history = []
        self.avg_fitness_history = []
        self.diversity_history = []
        self.stagnation_count = 0
        self.last_best_fitness = float("inf")

        # Set target count for this run
        self.target_count = target_count

        # Register population
        self.toolbox.register(
            "population", tools.initRepeat, list, self.toolbox.individual
        )

        # Initialize population
        pop = self.toolbox.population(n=GAConfig.POPULATION_SIZE)
        hof = tools.HallOfFame(GAConfig.ELITE_SIZE)

        # Evaluate initial population
        logger.info("=== STARTING GA WITH CONVERGENCE TRACKING ===")
        logger.info(f"Population Size: {GAConfig.POPULATION_SIZE}")
        logger.info(f"Max Generations: {GAConfig.GENERATIONS}")
        logger.info(f"Target Markets: {target_count}")
        logger.info("=" * 60)

        # Custom evolution loop for better tracking
        for gen in range(GAConfig.GENERATIONS):
            # Evaluate population
            fitnesses = list(map(self.toolbox.evaluate, pop))
            for ind, fit in zip(pop, fitnesses):
                ind.fitness.values = fit

            # Collect and log statistics
            stats = self._collect_stats(pop, gen)
            self._log_generation_stats(stats)

            # Update hall of fame
            hof.update(pop)

            # Check for early convergence
            if self.stagnation_count >= 10:
                logger.info(
                    f"EARLY CONVERGENCE at generation {gen} (5 generations without improvement)"
                )
                break

            # Selection
            offspring = self.toolbox.select(pop, len(pop))
            offspring = list(map(self.toolbox.clone, offspring))

            # Apply crossover
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < GAConfig.CROSSOVER_PROB:
                    self.toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values

            # Apply mutation
            for mutant in offspring:
                if random.random() < GAConfig.MUTATION_PROB:
                    self.toolbox.mutate(mutant)
                    del mutant.fitness.values

            # Replace population
            pop[:] = offspring

        # Final summary
        logger.info("=" * 60)
        logger.info("GA COMPLETED!")

        if self.stats_history:
            initial_fitness = self.best_fitness_history[0]
            final_fitness = self.best_fitness_history[-1]
            improvement = (initial_fitness - final_fitness) / initial_fitness * 100

            logger.info(f"CONVERGENCE SUMMARY:")
            logger.info(f"   • Total Generations: {len(self.stats_history)}")
            logger.info(f"   • Initial Best Fitness: {initial_fitness:.4f}")
            logger.info(f"   • Final Best Fitness: {final_fitness:.4f}")
            logger.info(f"   • Improvement: {improvement:.2f}%")
            logger.info(f"   • Final Diversity: {self.diversity_history[-1]:.4f}")
            logger.info(f"   • Final Stagnation: {self.stagnation_count} generations")

            # Detect convergence point
            convergence_gen = None
            for i in range(1, len(self.best_fitness_history)):
                if (
                    abs(self.best_fitness_history[i] - self.best_fitness_history[i - 1])
                    < 0.001
                ):
                    if i >= 2:
                        stable_count = 1
                        for j in range(
                            i + 1, min(i + 3, len(self.best_fitness_history))
                        ):
                            if (
                                abs(
                                    self.best_fitness_history[j]
                                    - self.best_fitness_history[i]
                                )
                                < 0.001
                            ):
                                stable_count += 1
                        if stable_count >= 2:
                            convergence_gen = i
                            break

            if convergence_gen:
                logger.info(f"   • Converged at Generation: {convergence_gen}")
                logger.info(f"   • Status: CONVERGED")
            else:
                logger.info(f"   • Status: NOT FULLY CONVERGED")

            # Show fitness evolution
            logger.info("FITNESS EVOLUTION:")
            for i, fitness in enumerate(self.best_fitness_history):
                diversity = self.diversity_history[i]
                status = ""
                if i > 0:
                    change = fitness - self.best_fitness_history[i - 1]
                    if abs(change) < 0.001:
                        status = "🔄"
                    elif change < 0:
                        status = "⬇️"
                    else:
                        status = "⬆️"

                logger.info(
                    f"   Gen {i:2d}: Fitness={fitness:.4f}, Diversity={diversity:.3f}"
                )

            # Plot fitness and diversity over generations
            plt.figure(figsize=(10, 6))
            plt.plot(
                range(len(self.best_fitness_history)),
                self.best_fitness_history,
                label="Best Fitness",
                color="blue",
            )
            plt.plot(
                range(len(self.avg_fitness_history)),
                self.avg_fitness_history,
                label="Avg Fitness",
                color="orange",
            )
            plt.xlabel("Generation")
            plt.ylabel("Fitness")
            plt.title("GA Fitness Over Generations")
            plt.legend()
            plt.grid(True)
            plt.twinx()
            plt.plot(
                range(len(self.diversity_history)),
                self.diversity_history,
                label="Diversity",
                color="green",
                linestyle="--",
            )
            plt.ylabel("Diversity")
            plt.legend(loc="upper right")
            # save to file
            # create folder if not exists
            import os
            from pathlib import Path

            static_dir = Path("static")
            resultdit = static_dir / "results"
            resultdit.mkdir(parents=True, exist_ok=True)
            plt.savefig(resultdit / "ga_fitness_diversity.png")
            plt.close()

        logger.info("=" * 60)

        return hof[0] if hof else []

    def get_convergence_summary(self) -> Dict[str, Any]:
        """Get summary of convergence statistics"""
        if not self.stats_history:
            return {"error": "No statistics available. Run GA first."}

        final_stats = self.stats_history[-1]

        # Calculate improvement rate
        if len(self.best_fitness_history) > 1:
            initial_fitness = self.best_fitness_history[0]
            final_fitness = self.best_fitness_history[-1]
            improvement_rate = (initial_fitness - final_fitness) / initial_fitness * 100
        else:
            improvement_rate = 0

        # Detect convergence point
        convergence_gen = None
        for i in range(1, len(self.best_fitness_history)):
            if (
                abs(self.best_fitness_history[i] - self.best_fitness_history[i - 1])
                < 0.001
            ):
                if i >= 3:  # Need at least 3 consecutive stable generations
                    stable_count = 1
                    for j in range(i + 1, min(i + 4, len(self.best_fitness_history))):
                        if (
                            abs(
                                self.best_fitness_history[j]
                                - self.best_fitness_history[i]
                            )
                            < 0.001
                        ):
                            stable_count += 1
                    if stable_count >= 3:
                        convergence_gen = i
                        break

        return {
            "total_generations": len(self.stats_history),
            "initial_best_fitness": self.best_fitness_history[0],
            "final_best_fitness": final_stats.best_fitness,
            "improvement_rate_percent": round(improvement_rate, 2),
            "final_diversity": round(final_stats.diversity, 4),
            "final_stagnation_count": final_stats.stagnation_count,
            "convergence_generation": convergence_gen,
            "converged": convergence_gen is not None,
            "average_fitness_final": round(final_stats.avg_fitness, 4),
            "fitness_std_final": round(final_stats.std_fitness, 4),
        }

    def find_nearest_markets(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Find n nearest markets using GA + Haversine + OSRM ranking"""
        logger.info(
            f"Finding {limit} nearest markets to ({self.target_lat}, {self.target_lng})"
        )

        # Load all active markets
        self.markets = (
            Market.query.filter_by(is_active=True)
            .filter(Market.latitude.isnot(None), Market.longitude.isnot(None))
            .all()
        )

        if not self.markets:
            logger.warning("No active markets found")
            return []

        logger.info(f"Found {len(self.markets)} active markets")
        # for market in self.markets:
        #     logger.info(f"  - Market {market.id}: {market.name}")

        # If markets <= limit, return all markets sorted by OSRM distance
        if len(self.markets) <= limit:
            logger.info(
                f"Markets count ({len(self.markets)}) <= limit ({limit}), returning all"
            )
            return self._rank_with_osrm(self.markets, len(self.markets))

        # Step 1: Use GA to find good subset with target count
        random.seed(42)
        np.random.seed(42)
        best_individual = self._run_ga(target_count=limit)
        logger.info(f"Best individual from GA: {best_individual}")
        logger.info(
            f"Selected markets count: {sum(best_individual) if best_individual else 0}"
        )

        # Step 2: Get selected markets from GA result
        if best_individual:
            logger.info("Using selected markets from GA")
            selected_indices = [i for i, v in enumerate(best_individual) if v == 1]
            selected_markets = [self.markets[i] for i in selected_indices]

        else:
            # Fallback: use closest markets by Haversine
            logger.info(
                f"No selected markets from GA, using closest {limit} markets by Haversine"
            )
            market_distances = []
            for market in self.markets:
                distance = self._haversine_distance(
                    self.target_lat, self.target_lng, market.latitude, market.longitude
                )
                market_distances.append((market, distance))
            market_distances.sort(key=lambda x: x[1])
            selected_markets = [market for market, _ in market_distances[:limit]]

        # Step 3: Final ranking with OSRM
        return self._rank_with_osrm(selected_markets, limit)

    def _rank_with_osrm(self, markets: List, limit: int) -> List[Dict[str, Any]]:
        """Rank markets using OSRM route distance"""
        logger.info(f"Ranking {len(markets)} markets using OSRM")
        for market in markets:
            logger.info(f"  - Market {market.id}: {market.name}")

        results = []
        for market in markets:
            # Try OSRM first
            distance = self._get_route_distance(
                (self.target_lat, self.target_lng), (market.latitude, market.longitude)
            )

            # Fallback to Haversine if OSRM fails
            if distance is None:
                distance = self._haversine_distance(
                    self.target_lat, self.target_lng, market.latitude, market.longitude
                )
                logger.warning(f"Market {market.id}: OSRM failed, using Haversine")

            results.append(
                {
                    "market": market,
                    "distance": round(distance, 2),
                    "latitude": market.latitude,
                    "longitude": market.longitude,
                }
            )

        # Sort by distance and return top n
        results.sort(key=lambda x: x["distance"])
        return results


def find_nearby_markets(
    target_lat: float, target_lng: float, limit: int = 5
) -> List[Dict[str, Any]]:
    """Convenience function to find nearby markets"""
    ga = MarketGA(target_lat, target_lng)
    return ga.find_nearest_markets(limit)
