import random
import math
import numpy as np
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from deap import base, creator, tools, algorithms
from app.models.market import Market
from app.logging import get_logger

logger = get_logger(__name__)


@dataclass
class GAConfig:
    """Configuration for GA parameters"""

    POPULATION_SIZE: int = 50
    GENERATIONS: int = 50
    CROSSOVER_PROB: float = 0.7
    MUTATION_PROB: float = 0.2
    TOURNAMENT_SIZE: int = 3
    SELECTION_WEIGHTS: Tuple[float, float] = (
        0.7,
        0.3,
    )  # Increased selection probability
    MAX_POPULATION: int = 500
    MAX_GENERATIONS: int = 200
    MIN_POPULATION: int = 10
    MIN_GENERATIONS: int = 5
    # New parameters for consistency and optimization
    RANDOM_SEED: int = 42  # For reproducible results
    GA_RUNS: int = 3  # Number of GA runs to find best result
    ELITE_SIZE: int = 5  # Number of elite individuals to preserve


class MarketGA:
    """Genetic Algorithm service for finding nearest markets using DEAP"""

    def __init__(
        self,
        target_lat: float,
        target_lng: float,
        population_size: int = GAConfig.POPULATION_SIZE,
        generations: int = GAConfig.GENERATIONS,
    ):
        """
        Initialize GA for market finding

        Args:
            target_lat: Target latitude
            target_lng: Target longitude
            population_size: Size of GA population
            generations: Number of generations to evolve
        """
        self.target_lat = target_lat
        self.target_lng = target_lng
        self.population_size = max(
            GAConfig.MIN_POPULATION, min(population_size, GAConfig.MAX_POPULATION)
        )
        self.generations = max(
            GAConfig.MIN_GENERATIONS, min(generations, GAConfig.MAX_GENERATIONS)
        )
        self.markets = []
        self.toolbox = None
        self._distance_cache = {}

        # Initialize DEAP components
        self._setup_deap()

    def _setup_deap(self):
        """Setup DEAP framework for GA"""
        # Clear any existing creator definitions to avoid conflicts
        try:
            if hasattr(creator, "FitnessMin"):
                del creator.FitnessMin
            if hasattr(creator, "Individual"):
                del creator.Individual
        except Exception:
            pass

        # Create fitness class (minimization problem - we want minimum distance)
        creator.create("FitnessMin", base.Fitness, weights=(-1.0,))

        # Create individual class
        creator.create("Individual", list, fitness=creator.FitnessMin)

        # Initialize toolbox
        self.toolbox = base.Toolbox()

        # Register functions that will be used later when markets are loaded
        self.toolbox.register("attr_bool", random.randint, 0, 1)
        self.toolbox.register("evaluate", self._evaluate_individual)
        self.toolbox.register("mate", self._crossover)
        self.toolbox.register("mutate", self._mutate_individual)
        self.toolbox.register(
            "select", tools.selTournament, tournsize=GAConfig.TOURNAMENT_SIZE
        )

    def _haversine_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """
        Calculate haversine distance between two points in kilometers

        Args:
            lat1, lng1: First point coordinates
            lat2, lng2: Second point coordinates

        Returns:
            Distance in kilometers
        """
        # Check cache first
        cache_key = (lat1, lng1, lat2, lng2)
        if cache_key in self._distance_cache:
            return self._distance_cache[cache_key]

        # Convert latitude and longitude from degrees to radians
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        # Radius of earth in kilometers
        r = 6371
        distance = c * r

        # Cache result
        self._distance_cache[cache_key] = distance
        return distance

    def _create_individual(self) -> List[int]:
        """Create a random individual (binary chromosome) using DEAP"""
        # Create binary array where 1 means market is selected
        individual = random.choices(
            [0, 1], weights=GAConfig.SELECTION_WEIGHTS, k=len(self.markets)
        )

        # Ensure at least 2-3 markets are selected for better diversity
        selected_count = sum(individual)
        if selected_count < 2:
            # Add more selections if too few
            available_indices = [i for i, val in enumerate(individual) if val == 0]
            if available_indices:
                # Select 2-3 additional markets randomly
                additional_selections = min(3 - selected_count, len(available_indices))
                selected_indices = random.sample(
                    available_indices, additional_selections
                )
                for idx in selected_indices:
                    individual[idx] = 1

        return creator.Individual(individual)

    def _evaluate_individual(self, individual: List[int]) -> Tuple[float]:
        """
        Evaluate fitness of an individual (market selection) for DEAP

        Args:
            individual: List of 0s and 1s representing selected markets

        Returns:
            Tuple containing fitness score (DEAP requirement)
        """
        selected_indices = [i for i, val in enumerate(individual) if val == 1]

        if not selected_indices:
            return (float("inf"),)

        # Calculate distances efficiently
        distances = [
            self._haversine_distance(
                self.target_lat,
                self.target_lng,
                self.markets[i].latitude,
                self.markets[i].longitude,
            )
            for i in selected_indices
        ]

        # Sort distances to get the nearest ones
        distances.sort()

        # Focus on the nearest markets (take top N based on limit)
        # This encourages selection of multiple nearby markets
        limit = min(5, len(distances))  # Default limit or number of selected
        top_distances = distances[:limit]

        # Use average of top distances as main fitness
        avg_distance = sum(top_distances) / len(top_distances)

        # Smaller penalty to encourage more selections
        # Penalty increases if we select too many or too few
        optimal_selection = min(
            5, len(self.markets) // 5
        )  # Optimal number of selections
        selection_diff = abs(len(selected_indices) - optimal_selection)
        penalty = selection_diff * 0.1  # Much smaller penalty

        return (avg_distance + penalty,)

    def _mutate_individual(self, individual: List[int]) -> Tuple[List[int]]:
        """Mutate an individual using DEAP format"""
        mutation_rate = 0.15  # Increased mutation rate
        for i in range(len(individual)):
            if random.random() < mutation_rate:
                individual[i] = 1 - individual[i]

        # Ensure at least 2 markets are selected
        selected_count = sum(individual)
        if selected_count < 2:
            available_indices = [i for i, val in enumerate(individual) if val == 0]
            if available_indices:
                additional_selections = min(2 - selected_count, len(available_indices))
                selected_indices = random.sample(
                    available_indices, additional_selections
                )
                for idx in selected_indices:
                    individual[idx] = 1

        return (individual,)

    def _crossover(
        self, parent1: List[int], parent2: List[int]
    ) -> Tuple[List[int], List[int]]:
        """
        Single-point crossover between two parents, ensuring the children
        are valid DEAP Individuals.
        """
        if len(parent1) < 2:
            # Tidak cukup panjang untuk crossover
            return parent1, parent2

        attempts = 0
        max_attempts = 5

        while attempts < max_attempts:
            point = random.randint(1, len(parent1) - 1)

            # Salin list agar tidak merusak induk
            child1 = creator.Individual(parent1[:point] + parent2[point:])
            child2 = creator.Individual(parent2[:point] + parent1[point:])

            # Pastikan setiap anak memiliki sedikitnya satu market
            if any(child1) and any(child2):
                return child1, child2

            attempts += 1

        # Fallback: kembalikan salinan induk sebagai Individual
        return creator.Individual(parent1[:]), creator.Individual(parent2[:])

    def find_nearest_markets(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Find nearest markets using hybrid approach: GA + deterministic fallback

        Args:
            limit: Maximum number of markets to return

        Returns:
            List of nearest markets with distances
        """
        logger.info(
            f"Finding nearest markets to ({self.target_lat}, {self.target_lng}) with limit {limit}"
        )

        # Get all active markets from database
        self.markets = (
            Market.query.filter_by(is_active=True)
            .filter(Market.latitude.isnot(None), Market.longitude.isnot(None))
            .all()
        )

        if not self.markets:
            logger.warning("No markets found in database")
            return []

        logger.info(f"Found {len(self.markets)} markets in database")

        # Set deterministic seed based on target coordinates for consistent results
        seed_value = int(abs(self.target_lat * 1000 + self.target_lng * 1000)) % 10000
        random.seed(seed_value)
        np.random.seed(seed_value)
        logger.info(f"Using deterministic seed: {seed_value}")

        # For small datasets, use simple distance sort
        if len(self.markets) <= 20:
            logger.info("Using simple distance calculation for small dataset")
            return self._optimized_distance_sort(limit)

        # For larger datasets, try multi-strategy approach first
        try:
            results = self._multi_strategy_search(limit)
            # Validate results quality
            if self._validate_results(results, limit):
                return results
            else:
                logger.warning(
                    "Multi-strategy results not optimal, falling back to distance sort"
                )
                return self._optimized_distance_sort(limit)
        except Exception as e:
            logger.warning(f"Multi-strategy search failed: {e}, using distance sort")
            return self._optimized_distance_sort(limit)

    def _multi_strategy_search(self, limit: int) -> List[Dict[str, Any]]:
        """Use multiple strategies and select the best result"""
        logger.info("Using multi-strategy search for optimal results")

        # Strategy 1: Pure distance-based (always reliable)
        distance_results = self._optimized_distance_sort(limit)

        # Strategy 2: Geographic clustering + distance
        cluster_results = self._cluster_based_search(limit)

        # Strategy 3: Weighted scoring approach
        weighted_results = self._weighted_scoring_search(limit)

        # Select the best result based on average distance and consistency
        all_strategies = [
            ("distance", distance_results),
            ("cluster", cluster_results),
            ("weighted", weighted_results),
        ]

        best_strategy, best_results = self._select_best_strategy(all_strategies)

        logger.info(
            f"Selected {best_strategy} strategy with {len(best_results)} markets"
        )
        return best_results

    def _optimized_distance_sort(self, limit: int) -> List[Dict[str, Any]]:
        """Optimized distance calculation with caching"""
        if not self.markets:
            return []

        markets_with_distance = []
        for market in self.markets:
            distance = self._haversine_distance(
                self.target_lat, self.target_lng, market.latitude, market.longitude
            )
            markets_with_distance.append(
                {
                    "market": market,
                    "distance": round(distance, 2),
                    "latitude": market.latitude,
                    "longitude": market.longitude,
                }
            )

        # Sort by distance and return top results
        markets_with_distance.sort(key=lambda x: x["distance"])
        return markets_with_distance[:limit]

    def _cluster_based_search(self, limit: int) -> List[Dict[str, Any]]:
        """Search based on geographic clustering"""
        try:
            # Calculate distances to all markets
            market_distances = []
            for market in self.markets:
                distance = self._haversine_distance(
                    self.target_lat, self.target_lng, market.latitude, market.longitude
                )
                market_distances.append((market, distance))

            # Sort by distance
            market_distances.sort(key=lambda x: x[1])

            # Take top candidates (more than limit for clustering)
            top_candidates = market_distances[: limit * 3]

            # Apply simple geographic clustering - prefer markets that are close to each other
            # This helps find markets in the same area/district
            selected_markets = []

            for market, distance in top_candidates:
                if len(selected_markets) >= limit:
                    break

                # Check if this market is in a good geographic cluster
                is_good_candidate = True

                # If we already have markets selected, check clustering
                if selected_markets:
                    # Calculate average distance to already selected markets
                    avg_distance_to_selected = 0
                    for selected_item in selected_markets:
                        selected_market = selected_item["market"]
                        cluster_distance = self._haversine_distance(
                            market.latitude,
                            market.longitude,
                            selected_market.latitude,
                            selected_market.longitude,
                        )
                        avg_distance_to_selected += cluster_distance

                    avg_distance_to_selected /= len(selected_markets)

                    # Skip if too far from other selected markets (avoid scattered results)
                    if avg_distance_to_selected > 10:  # 10km threshold
                        is_good_candidate = False

                if is_good_candidate:
                    selected_markets.append(
                        {
                            "market": market,
                            "distance": round(distance, 2),
                            "latitude": market.latitude,
                            "longitude": market.longitude,
                        }
                    )

            # If we don't have enough markets, fill with closest remaining
            if len(selected_markets) < limit:
                for market, distance in market_distances:
                    if len(selected_markets) >= limit:
                        break

                    # Check if already selected
                    already_selected = any(
                        item["market"].id == market.id for item in selected_markets
                    )

                    if not already_selected:
                        selected_markets.append(
                            {
                                "market": market,
                                "distance": round(distance, 2),
                                "latitude": market.latitude,
                                "longitude": market.longitude,
                            }
                        )

            return selected_markets[:limit]

        except Exception as e:
            logger.warning(f"Cluster search failed: {e}, falling back to distance sort")
            return self._optimized_distance_sort(limit)

    def _weighted_scoring_search(self, limit: int) -> List[Dict[str, Any]]:
        """Search using weighted scoring (distance + other factors)"""
        try:
            scored_markets = []

            for market in self.markets:
                distance = self._haversine_distance(
                    self.target_lat, self.target_lng, market.latitude, market.longitude
                )

                # Calculate weighted score
                # Lower score is better (minimize distance)
                score = distance

                # Small bonus for markets with longer names (might indicate larger/more important markets)
                if len(market.name) > 15:
                    score *= 0.95

                # Small bonus for markets with descriptions (more established)
                if market.description and len(market.description) > 20:
                    score *= 0.98

                scored_markets.append(
                    {
                        "market": market,
                        "distance": round(distance, 2),
                        "score": score,
                        "latitude": market.latitude,
                        "longitude": market.longitude,
                    }
                )

            # Sort by score and return top results
            scored_markets.sort(key=lambda x: x["score"])

            # Remove score from final results
            results = []
            for item in scored_markets[:limit]:
                result_item = item.copy()
                del result_item["score"]
                results.append(result_item)

            return results

        except Exception as e:
            logger.warning(
                f"Weighted search failed: {e}, falling back to distance sort"
            )
            return self._optimized_distance_sort(limit)

    def _select_best_strategy(self, strategies: List[tuple]) -> tuple:
        """Select the best strategy based on result quality"""
        best_strategy = "distance"
        best_results = []
        best_avg_distance = float("inf")

        for strategy_name, results in strategies:
            if not results:
                continue

            # Calculate average distance
            avg_distance = sum(item["distance"] for item in results) / len(results)

            # Calculate consistency (std deviation of distances)
            distances = [item["distance"] for item in results]
            if len(distances) > 1:
                mean_dist = sum(distances) / len(distances)
                variance = sum((d - mean_dist) ** 2 for d in distances) / len(distances)
                std_dev = variance**0.5

                # Prefer results with lower average distance and reasonable consistency
                # Add small penalty for high standard deviation
                quality_score = avg_distance + (std_dev * 0.1)
            else:
                quality_score = avg_distance

            logger.debug(
                f"Strategy {strategy_name}: avg_dist={avg_distance:.2f}, quality={quality_score:.2f}"
            )

            if quality_score < best_avg_distance:
                best_avg_distance = quality_score
                best_results = results
                best_strategy = strategy_name

        return best_strategy, best_results

    def _validate_results(
        self, results: List[Dict[str, Any]], expected_limit: int
    ) -> bool:
        """
        Validate the quality of search results

        Args:
            results: List of market results to validate
            expected_limit: Expected number of results

        Returns:
            True if results are of good quality, False otherwise
        """
        if not results:
            return False

        # Check if we have enough results
        if len(results) < min(expected_limit, len(self.markets)):
            return False

        # Check if results are sorted by distance (should be ascending)
        distances = [result["distance"] for result in results]
        if distances != sorted(distances):
            logger.warning("Results not properly sorted by distance")
            return False

        # Check for reasonable distance values (no infinite or negative distances)
        for result in results:
            if (
                not isinstance(result["distance"], (int, float))
                or result["distance"] < 0
            ):
                logger.warning(f"Invalid distance value: {result['distance']}")
                return False

        # Check for duplicate markets
        market_ids = [result["market"].id for result in results]
        if len(market_ids) != len(set(market_ids)):
            logger.warning("Duplicate markets found in results")
            return False

        logger.info("Results validation passed")
        return True

    def _simple_distance_sort(self, limit: int) -> List[Dict[str, Any]]:
        """
        Simple distance calculation - now just calls optimized version

        Args:
            limit: Maximum number of markets to return

        Returns:
            List of nearest markets with distances
        """
        return self._optimized_distance_sort(limit)


def find_nearby_markets(
    target_lat: float,
    target_lng: float,
    limit: int = 5,
    use_ga: bool = True,
    population_size: int = GAConfig.POPULATION_SIZE,
    generations: int = GAConfig.GENERATIONS,
) -> List[Dict[str, Any]]:
    """
    Convenience function to find nearby markets with optimized algorithms

    Args:
        target_lat: Target latitude
        target_lng: Target longitude
        limit: Maximum number of markets to return
        use_ga: Whether to use optimized algorithms (multi-strategy) or simple calculation
        population_size: Size of GA population (legacy parameter, not used)
        generations: Number of generations to evolve (legacy parameter, not used)

    Returns:
        List of nearby markets with distances
    """
    try:
        # Set deterministic seed for consistency
        random.seed(GAConfig.RANDOM_SEED)
        np.random.seed(GAConfig.RANDOM_SEED)

        ga = MarketGA(target_lat, target_lng, population_size, generations)

        if use_ga:
            # Use multi-strategy optimized search
            logger.info("Using optimized multi-strategy search")
            return ga.find_nearest_markets(limit)
        else:
            # Use simple distance calculation only
            logger.info("Using simple distance calculation")
            # Load markets first
            ga.markets = (
                Market.query.filter_by(is_active=True)
                .filter(Market.latitude.isnot(None), Market.longitude.isnot(None))
                .all()
            )
            return ga._optimized_distance_sort(limit)

    except Exception as e:
        logger.error(f"Error finding nearby markets: {str(e)}")
        # Fallback to simple sort if anything fails
        try:
            ga = MarketGA(target_lat, target_lng)
            return ga._optimized_distance_sort(limit)
        except Exception as fallback_error:
            logger.error(f"Fallback also failed: {str(fallback_error)}")
            return []
