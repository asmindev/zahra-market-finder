from app import db
from app.models.market import Market, MarketCategory, MarketImage
from app.utils.file_handler import FileHandler
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

        # Apply category filter
        if category:
            logger.debug(f"Applying category filter: {category}")
            # Convert string to enum if needed
            if isinstance(category, str):
                try:
                    category_enum = MarketCategory(category)
                    query = query.filter(Market.category == category_enum)
                except ValueError:
                    logger.warning(f"Invalid category: {category}")
            else:
                query = query.filter(Market.category == category)

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
    def create_market(data, files=None):
        """Create new market with optional images"""
        logger.info(f"Creating new market: {data.get('name')}")

        market = Market()
        market.name = data.get("name")
        market.description = data.get("description")
        market.location = data.get("location")
        market.latitude = data.get("latitude")
        market.longitude = data.get("longitude")

        # Handle category
        category = data.get("category")
        if category:
            if isinstance(category, str):
                try:
                    market.category = MarketCategory(category)
                except ValueError:
                    logger.warning(f"Invalid category: {category}, using default")
                    market.category = MarketCategory.GENERAL
            else:
                market.category = category
        else:
            market.category = MarketCategory.GENERAL

        db.session.add(market)
        db.session.flush()  # Flush to get the market ID

        # Handle image uploads
        if files:
            for file in files:
                try:
                    file_info = FileHandler.save_file(file)
                    if file_info:
                        market_image = MarketImage(
                            market_id=market.id,
                            filename=file_info["filename"],
                            original_filename=file_info["original_filename"],
                            file_path=file_info["file_path"],
                            file_size=file_info["file_size"],
                            mime_type=file_info["mime_type"],
                        )
                        db.session.add(market_image)
                        logger.info(f"Added image: {file_info['original_filename']}")
                except Exception as e:
                    logger.error(f"Error saving image: {str(e)}")
                    # Continue with other images even if one fails

        db.session.commit()

        logger.info(f"Successfully created market with ID: {market.id}")
        return market

    @staticmethod
    def update_market(market_id, data, files=None, delete_image_ids=None):
        """Update market with image management"""
        logger.info(f"Updating market with ID: {market_id}")

        market = Market.query.filter_by(id=market_id, is_active=True).first()
        if not market:
            logger.warning(f"Market not found for update with ID: {market_id}")
            return None

        # Update market fields
        for key, value in data.items():
            if hasattr(market, key) and key not in ["id", "images"]:
                if key == "category" and value:
                    # Handle category conversion
                    if isinstance(value, str):
                        try:
                            value = MarketCategory(value)
                        except ValueError:
                            logger.warning(
                                f"Invalid category: {value}, skipping update"
                            )
                            continue
                logger.debug(f"Updating {key}: {getattr(market, key)} -> {value}")
                setattr(market, key, value)

        # Handle image deletions
        if delete_image_ids:
            for image_id in delete_image_ids:
                image = MarketImage.query.filter_by(
                    id=image_id, market_id=market_id
                ).first()
                if image:
                    # Delete file from filesystem
                    FileHandler.delete_file(image.file_path)
                    # Delete from database
                    db.session.delete(image)
                    logger.info(f"Deleted image: {image.original_filename}")

        # Handle new image uploads
        if files:
            for file in files:
                try:
                    file_info = FileHandler.save_file(file)
                    if file_info:
                        market_image = MarketImage(
                            market_id=market.id,
                            filename=file_info["filename"],
                            original_filename=file_info["original_filename"],
                            file_path=file_info["file_path"],
                            file_size=file_info["file_size"],
                            mime_type=file_info["mime_type"],
                        )
                        db.session.add(market_image)
                        logger.info(
                            f"Added new image: {file_info['original_filename']}"
                        )
                except Exception as e:
                    logger.error(f"Error saving new image: {str(e)}")

        db.session.commit()
        logger.info(f"Successfully updated market: {market.name}")
        return market

    @staticmethod
    def delete_market(market_id):
        """Soft delete market and cleanup images"""
        logger.info(f"Deleting market with ID: {market_id}")

        market = Market.query.filter_by(id=market_id, is_active=True).first()
        if not market:
            logger.warning(f"Market not found for deletion with ID: {market_id}")
            return False

        # Delete all associated images from filesystem
        for image in market.images:
            FileHandler.delete_file(image.file_path)
            logger.info(f"Deleted image file: {image.original_filename}")

        # Soft delete market (images will be deleted by cascade)
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
