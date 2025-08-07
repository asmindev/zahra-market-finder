import random
import math
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass
from deap import base, creator, tools, algorithms
from app.models.market import Market
from app.logging import get_logger
import requests
from functools import lru_cache

logger = get_logger(__name__)


@dataclass
class GAConfig:
    """Simplified GA configuration"""

    POPULATION_SIZE: int = 30
    GENERATIONS: int = 20
    CROSSOVER_PROB: float = 0.7
    MUTATION_PROB: float = 0.2
    TOURNAMENT_SIZE: int = 3
    ELITE_SIZE: int = 3


class MarketGA:
    """Compact GA service to find nearest markets"""

    def __init__(self, target_lat: float, target_lng: float):
        self.target_lat = target_lat
        self.target_lng = target_lng
        self.markets = []
        self.toolbox = None
        self._distance_cache = {}
        self.target_count = None  # Will be set when running GA
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

    @lru_cache(maxsize=256)
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
            distances.append(distance)

        avg_distance = sum(distances) / len(distances)

        # Add penalty for not matching target count
        count_penalty = 0
        if self.target_count:
            count_diff = abs(len(selected_indices) - self.target_count)
            count_penalty = count_diff * 10.0  # Heavy penalty for wrong count

        return (avg_distance + count_penalty,)

    def _mutate_individual(self, individual: List[int]) -> Tuple[List[int]]:
        """Mutate individual by flipping some bits"""
        for i in range(len(individual)):
            if random.random() < 0.1:
                individual[i] = 1 - individual[i]

        # Ensure at least 1 market is selected
        if sum(individual) == 0:
            individual[random.randint(0, len(individual) - 1)] = 1

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
        """Run genetic algorithm to find optimal market selection"""
        if not self.markets:
            return []

        # Set target count for this run
        self.target_count = target_count

        # Register population
        self.toolbox.register(
            "population", tools.initRepeat, list, self.toolbox.individual
        )

        # Run GA
        pop = self.toolbox.population(n=GAConfig.POPULATION_SIZE)
        hof = tools.HallOfFame(GAConfig.ELITE_SIZE)

        algorithms.eaSimple(
            pop,
            self.toolbox,
            cxpb=GAConfig.CROSSOVER_PROB,
            mutpb=GAConfig.MUTATION_PROB,
            ngen=GAConfig.GENERATIONS,
            halloffame=hof,
            verbose=False,
        )

        return hof[0] if hof else []

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
            selected_indices = [i for i, v in enumerate(best_individual) if v == 1]
            selected_markets = [self.markets[i] for i in selected_indices]
        else:
            # Fallback: use closest markets by Haversine
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
        return results[:limit]


def find_nearby_markets(
    target_lat: float, target_lng: float, limit: int = 5
) -> List[Dict[str, Any]]:
    """Convenience function to find nearby markets"""
    ga = MarketGA(target_lat, target_lng)
    return ga.find_nearest_markets(limit)
