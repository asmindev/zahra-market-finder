from flask import Blueprint, request, jsonify, send_from_directory
import json
import os
from app.services.market import MarketService
from app.utils.response import APIResponse, RequestValidator
from app.utils.auth import admin_required, token_required
from app.logging import get_logger

# Setup logging
logger = get_logger(__name__)

# Create Blueprint
market_bp = Blueprint("markets", __name__)


@market_bp.route("/", methods=["GET"])
def get_markets():
    """Get all markets with pagination and filtering"""
    logger.info("GET /api/markets - Fetching markets list")

    try:
        # Get query parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("search", None)
        category = request.args.get("category", None)

        logger.debug(
            f"Request params - page: {page}, per_page: {per_page}, search: {search}, category: {category}"
        )

        # Validate pagination parameters
        page, per_page, errors = RequestValidator.validate_pagination(page, per_page)
        if errors:
            logger.warning(f"Pagination validation errors: {errors}")
            return APIResponse.bad_request(
                "Invalid pagination parameters", {"validation_errors": errors}
            )

        result = MarketService.get_all_markets(
            page=page, per_page=per_page, search=search, category=category
        )

        logger.info(f"Successfully fetched {len(result.get('items', []))} markets")

        # Return paginated response
        return APIResponse.paginated_response(
            data=result.get("items", []),
            page=page,
            per_page=per_page,
            total=result.get("total", 0),
        )

    except Exception as e:
        logger.error(f"Error fetching markets: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to fetch markets")


@market_bp.route("/<int:market_id>", methods=["GET"])
def get_market(market_id):
    """Get market by ID"""
    logger.info(f"GET /api/markets/{market_id} - Fetching market details")

    try:
        market = MarketService.get_market_by_id(market_id)

        if not market:
            logger.warning(f"Market not found with ID: {market_id}")
            return APIResponse.not_found("Market", market_id)

        logger.info(f"Successfully fetched market: {market.name}")
        return APIResponse.success(market.to_dict(), "Market retrieved successfully")

    except Exception as e:
        logger.error(f"Error fetching market {market_id}: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to fetch market")


@market_bp.route("/", methods=["POST"])
@admin_required
def create_market():
    """Create new market with optional images"""
    logger.info("POST /api/markets - Creating new market")

    try:
        # Handle multipart form data
        data = {}

        # Get form data
        for key in request.form:
            data[key] = request.form.get(key)

        # Convert latitude and longitude to float if provided
        if "latitude" in data and data["latitude"]:
            try:
                data["latitude"] = float(data["latitude"])
            except ValueError:
                pass

        if "longitude" in data and data["longitude"]:
            try:
                data["longitude"] = float(data["longitude"])
            except ValueError:
                pass

        logger.debug(f"Request data: {data}")

        # Validate required fields
        required_fields = ["name", "location"]
        validation_errors = RequestValidator.validate_required_fields(
            data, required_fields
        )

        if validation_errors:
            logger.warning(f"Validation errors: {validation_errors}")
            return APIResponse.validation_error(validation_errors)

        # Get uploaded files
        files = request.files.getlist("images") if "images" in request.files else None

        market = MarketService.create_market(data, files)

        logger.info(f"Successfully created market: {market.name} with ID: {market.id}")
        return APIResponse.created(market.to_dict(), "Market created successfully")

    except Exception as e:
        logger.error(f"Error creating market: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to create market")


@market_bp.route("/<int:market_id>", methods=["PUT"])
@admin_required
def update_market(market_id):
    """Update market with image management"""
    logger.info(f"PUT /api/markets/{market_id} - Updating market")

    try:
        # Handle multipart form data
        data = {}

        # Get form data
        for key in request.form:
            if key not in ["delete_images"]:  # Handle delete_images separately
                data[key] = request.form.get(key)

        # Convert latitude and longitude to float if provided
        if "latitude" in data and data["latitude"]:
            try:
                data["latitude"] = float(data["latitude"])
            except ValueError:
                pass

        if "longitude" in data and data["longitude"]:
            try:
                data["longitude"] = float(data["longitude"])
            except ValueError:
                pass

        logger.debug(f"Update data for market {market_id}: {data}")

        # Get images to delete (array of IDs)
        delete_image_ids = []
        if "delete_images" in request.form:
            delete_ids_str = request.form.get("delete_images")
            if delete_ids_str:
                try:
                    # Parse JSON array or comma-separated string
                    if delete_ids_str.startswith("["):
                        delete_image_ids = json.loads(delete_ids_str)
                    else:
                        delete_image_ids = [
                            int(id.strip())
                            for id in delete_ids_str.split(",")
                            if id.strip()
                        ]
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f"Invalid delete_images format: {delete_ids_str}")

        # Get new images to upload
        files = request.files.getlist("images") if "images" in request.files else None

        market = MarketService.update_market(market_id, data, files, delete_image_ids)

        if not market:
            logger.warning(f"Market not found for update with ID: {market_id}")
            return APIResponse.not_found("Market", market_id)

        logger.info(f"Successfully updated market: {market.name}")
        return APIResponse.success(market.to_dict(), "Market updated successfully")

    except Exception as e:
        logger.error(f"Error updating market {market_id}: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to update market")


@market_bp.route("/<int:market_id>", methods=["DELETE"])
@admin_required
def delete_market(market_id):
    """Delete market"""
    logger.info(f"DELETE /api/markets/{market_id} - Deleting market")

    try:
        success = MarketService.delete_market(market_id)

        if not success:
            logger.warning(f"Market not found for deletion with ID: {market_id}")
            return APIResponse.not_found("Market", market_id)

        logger.info(f"Successfully deleted market with ID: {market_id}")
        return APIResponse.no_content("Market deleted successfully")

    except Exception as e:
        logger.error(f"Error deleting market {market_id}: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to delete market")


@market_bp.route("/search/location", methods=["GET"])
def search_markets_by_location():
    """Search markets by location"""
    logger.info("GET /api/markets/search/location - Searching markets by location")

    try:
        latitude = request.args.get("latitude", type=float)
        longitude = request.args.get("longitude", type=float)
        radius = request.args.get(
            "radius", 10, type=int
        )  # Convert to int to fix type error

        logger.debug(
            f"Location search params - lat: {latitude}, lng: {longitude}, radius: {radius}"
        )

        # Validate coordinates
        validation_errors = RequestValidator.validate_coordinates(latitude, longitude)
        if validation_errors:
            logger.warning(f"Coordinate validation errors: {validation_errors}")
            return APIResponse.bad_request(
                "Invalid coordinates", {"validation_errors": validation_errors}
            )

        # Validate radius
        if radius <= 0:
            logger.warning(f"Invalid radius: {radius}")
            return APIResponse.bad_request("Radius must be greater than 0")

        markets = MarketService.search_markets_by_location(latitude, longitude, radius)

        logger.info(
            f"Found {len(markets)} markets within {radius}km of ({latitude}, {longitude})"
        )
        return APIResponse.success(
            markets, f"Found {len(markets)} markets within {radius}km"
        )

    except Exception as e:
        logger.error(f"Error searching markets by location: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to search markets by location")


@market_bp.route("/search", methods=["GET"])
def search_markets():
    """Search markets by name or location"""
    logger.info("GET /api/markets/search - Searching markets by query")

    try:
        query = request.args.get("q", "")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        logger.debug(
            f"Search params - query: '{query}', page: {page}, per_page: {per_page}"
        )

        # Validate pagination parameters
        page, per_page, validation_errors = RequestValidator.validate_pagination(
            page, per_page
        )
        if validation_errors:
            logger.warning(f"Pagination validation errors: {validation_errors}")
            return APIResponse.bad_request(
                "Invalid pagination parameters",
                {"validation_errors": validation_errors},
            )

        result = MarketService.search_markets(query, page, per_page)

        if not result.get("items"):
            logger.info(f"No markets found for query: '{query}'")
            return APIResponse.success([], f"No markets found for query: '{query}'")

        logger.info(
            f"Found {len(result.get('items', []))} markets for query: '{query}'"
        )

        # Return paginated response
        return APIResponse.paginated_response(
            data=result.get("items", []),
            page=page,
            per_page=per_page,
            total=result.get("total", 0),
        )

    except Exception as e:
        logger.error(f"Error searching markets: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to search markets")


@market_bp.route("/nearby", methods=["POST"])
def find_nearby_markets():
    """Find nearby markets using Genetic Algorithm"""
    logger.info("POST /api/markets/nearby - Finding nearby markets using GA")

    try:
        # Get request data
        data = request.get_json()

        if not data:
            logger.warning("No JSON data provided")
            return APIResponse.bad_request("Request body is required")

        # Validate required fields
        required_fields = ["latitude", "longitude"]
        validation_errors = RequestValidator.validate_required_fields(
            data, required_fields
        )

        if validation_errors:
            logger.warning(f"Validation errors: {validation_errors}")
            return APIResponse.validation_error(validation_errors)

        # Extract and validate coordinates
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        limit = data.get("limit", 5)  # Default to 5 nearest markets
        use_ga = data.get("use_ga", True)  # Default to using GA

        # Validate coordinates
        coord_errors = RequestValidator.validate_coordinates(latitude, longitude)
        if coord_errors:
            logger.warning(f"Coordinate validation errors: {coord_errors}")
            return APIResponse.validation_error(coord_errors)

        # Validate limit
        if not isinstance(limit, int) or limit < 1 or limit > 50:
            logger.warning(f"Invalid limit: {limit}")
            return APIResponse.bad_request("Limit must be an integer between 1 and 50")

        logger.info(
            f"Finding {limit} nearest markets to ({latitude}, {longitude}) using GA"
        )

        # Import GA service
        from app.ga.market_finder import find_nearby_markets

        # Find nearby markets
        nearby_markets = find_nearby_markets(
            target_lat=latitude,
            target_lng=longitude,
            limit=limit,
        )

        # Format response
        response_data = []
        for item in nearby_markets:
            logger.info(
                f"Processing market: {item['market'].name} at distance {item['distance']} km"
            )
            market_data = item["market"].to_dict()
            market_data["distance_km"] = round(item["distance"], 2)
            response_data.append(market_data)

        logger.info(f"Found {len(response_data)} nearby markets")

        return APIResponse.success(
            data=response_data,
            message=f"Found {len(response_data)} nearby markets",
            meta={
                "search_location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "algorithm_used": "genetic_algorithm" if use_ga else "simple_distance",
                "total_found": len(response_data),
            },
        )

    except ImportError as e:
        logger.error(f"GA dependencies not available: {str(e)}", exc_info=True)
        return APIResponse.internal_error(
            "Genetic Algorithm dependencies not available. Please install required packages."
        )

    except Exception as e:
        logger.error(f"Error finding nearby markets: {str(e)}", exc_info=True)
        return APIResponse.internal_error("Failed to find nearby markets")


@market_bp.route("/images/<filename>", methods=["GET"])
def serve_market_image(filename):
    """Serve market image files"""
    try:
        from flask import current_app

        upload_folder = os.path.join(
            current_app.root_path, "static", "uploads", "markets"
        )
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        logger.error(f"Error serving image {filename}: {str(e)}")
        return APIResponse.not_found("Image", filename)
