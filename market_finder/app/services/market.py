from app import db
from app.models.market import Market
from app.logging import get_logger
from sqlalchemy import or_

# Setup logging
logger = get_logger(__name__)


class MarketService:
    """Service class for Market operations"""

    @staticmethod
    def get_all_markets(page=1, per_page=10, search=None, category=None):
        """Get all markets with pagination and filtering"""
        logger.debug(
            f"Fetching markets - page: {page}, per_page: {per_page}, search: {search}"
        )

        query = Market.query.filter_by(is_active=True)

        # Apply search filter
        if search:
            logger.debug(f"Applying search filter: {search}")
            query = query.filter(
                or_(
                    Market.name.contains(search),
                    Market.description.contains(search),
                    Market.location.contains(search),
                )
            )

        # Apply category filter (remove this as Market model doesn't have category field)
        # if category:
        #     query = query.filter(Market.category == category)

        # Order by name
        query = query.order_by(Market.name)

        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        logger.info(f"Found {pagination.total} markets, returning page {page}")

        return {
            "items": [market.to_dict() for market in pagination.items],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        }

    @staticmethod
    def get_market_by_id(market_id):
        """Get market by ID"""
        logger.debug(f"Fetching market with ID: {market_id}")
        market = Market.query.filter_by(id=market_id, is_active=True).first()

        if market:
            logger.debug(f"Found market: {market.name}")
        else:
            logger.warning(f"Market not found with ID: {market_id}")

        return market

    @staticmethod
    def create_market(data):
        """Create new market"""
        logger.info(f"Creating new market: {data.get('name')}")

        market = Market()
        market.name = data.get("name")
        market.description = data.get("description")
        market.location = data.get("location")
        market.latitude = data.get("latitude")
        market.longitude = data.get("longitude")

        db.session.add(market)
        db.session.commit()

        logger.info(f"Successfully created market with ID: {market.id}")
        return market

    @staticmethod
    def update_market(market_id, data):
        """Update market"""
        logger.info(f"Updating market with ID: {market_id}")

        market = Market.query.filter_by(id=market_id, is_active=True).first()
        if not market:
            logger.warning(f"Market not found for update with ID: {market_id}")
            return None

        # Update fields
        for key, value in data.items():
            if hasattr(market, key) and key != "id":
                logger.debug(f"Updating {key}: {getattr(market, key)} -> {value}")
                setattr(market, key, value)

        db.session.commit()
        logger.info(f"Successfully updated market: {market.name}")
        return market

    @staticmethod
    def delete_market(market_id):
        """Soft delete market"""
        logger.info(f"Deleting market with ID: {market_id}")

        market = Market.query.filter_by(id=market_id, is_active=True).first()
        if not market:
            logger.warning(f"Market not found for deletion with ID: {market_id}")
            return False

        market.is_active = False
        db.session.commit()

        logger.info(f"Successfully deleted market: {market.name}")
        return True

    @staticmethod
    def search_markets_by_location(latitude, longitude, radius_km=10):
        """Search markets by location within radius"""
        logger.info(
            f"Searching markets within {radius_km}km of ({latitude}, {longitude})"
        )

        # Simple distance calculation (you can use more sophisticated methods)
        markets = Market.query.filter_by(is_active=True).all()
        nearby_markets = []

        for market in markets:
            if market.latitude and market.longitude:
                # Calculate approximate distance
                lat_diff = abs(market.latitude - latitude)
                lng_diff = abs(market.longitude - longitude)

                # Simple approximation (not accurate for large distances)
                if lat_diff <= radius_km / 111 and lng_diff <= radius_km / 111:
                    nearby_markets.append(market)

        logger.info(f"Found {len(nearby_markets)} markets within radius")
        return [market.to_dict() for market in nearby_markets]

    @staticmethod
    def search_markets(query, page, per_page):
        """Search markets by name or location"""
        logger.info(
            f"Searching markets with query: '{query}' (page {page}, per_page {per_page})"
        )

        markets_pagination = (
            Market.query.filter(
                or_(
                    Market.name.contains(query),
                    Market.location.contains(query),
                )
            )
            .filter_by(is_active=True)
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        logger.info(f"Found {markets_pagination.total} markets matching query")

        return {
            "items": [market.to_dict() for market in markets_pagination.items],
            "total": markets_pagination.total,
            "pages": markets_pagination.pages,
            "current_page": markets_pagination.page,
            "per_page": markets_pagination.per_page,
            "has_next": markets_pagination.has_next,
            "has_prev": markets_pagination.has_prev,
        }
