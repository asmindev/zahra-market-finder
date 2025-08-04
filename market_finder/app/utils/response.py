from flask import jsonify
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)


class APIResponse:
    """Utility class for consistent API responses following RESTful standards"""

    @staticmethod
    def success(data=None, message=None, status_code=200, meta=None):
        """
        Create a successful response

        Args:
            data: Response data
            message: Success message
            status_code: HTTP status code (default: 200)
            meta: Additional metadata (pagination, etc.)
        """
        response = {"success": True, "timestamp": datetime.utcnow().isoformat() + "Z"}

        if message:
            response["message"] = message

        if data is not None:
            response["data"] = data

        if meta:
            response["meta"] = meta

        logger.info(f"API Success Response: {status_code} - {message or 'Success'}")
        # time.sleep(5)
        return jsonify(response), status_code

    @staticmethod
    def error(message, status_code=400, error_code=None, details=None):
        """
        Create an error response

        Args:
            message: Error message
            status_code: HTTP status code
            error_code: Application-specific error code
            details: Additional error details
        """
        response = {
            "success": False,
            "error": {
                "message": message,
                "code": error_code or f"E{status_code}",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        }

        if details:
            response["error"]["details"] = details

        logger.error(f"API Error Response: {status_code} - {message}")
        return jsonify(response), status_code

    @staticmethod
    def created(data, message="Resource created successfully", location=None):
        """Create a 201 Created response"""
        response = APIResponse.success(data, message, 201)
        return response

    @staticmethod
    def no_content(message="Operation completed successfully"):
        """Create a 204 No Content response"""
        logger.info(f"API No Content Response: {message}")
        return "", 204

    @staticmethod
    def not_found(resource="Resource", resource_id=None):
        """Create a 404 Not Found response"""
        message = f"{resource} not found"
        if resource_id:
            message += f" with ID: {resource_id}"
        return APIResponse.error(message, 404, "RESOURCE_NOT_FOUND")

    @staticmethod
    def bad_request(message="Invalid request data", details=None):
        """Create a 400 Bad Request response"""
        return APIResponse.error(message, 400, "BAD_REQUEST", details)

    @staticmethod
    def validation_error(errors):
        """Create a 422 Unprocessable Entity response for validation errors"""
        return APIResponse.error(
            "Validation failed", 422, "VALIDATION_ERROR", {"validation_errors": errors}
        )

    @staticmethod
    def internal_error(message="Internal server error"):
        """Create a 500 Internal Server Error response"""
        return APIResponse.error(message, 500, "INTERNAL_ERROR")

    @staticmethod
    def paginated_response(data, page, per_page, total, **kwargs):
        """
        Create a paginated response with metadata

        Args:
            data: List of items
            page: Current page number
            per_page: Items per page
            total: Total number of items
        """
        total_pages = (total + per_page - 1) // per_page

        meta = {
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_items": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            }
        }

        # Add any additional metadata
        meta.update(kwargs)

        return APIResponse.success(data, meta=meta)


class RequestValidator:
    """Utility class for request validation"""

    @staticmethod
    def validate_required_fields(data, required_fields):
        """
        Validate that required fields are present in request data

        Args:
            data: Request data dictionary
            required_fields: List of required field names

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        if not data:
            return ["Request body is required"]

        for field in required_fields:
            if field not in data:
                errors.append(f"Field '{field}' is required")
            elif data[field] is None or (
                isinstance(data[field], str) and not data[field].strip()
            ):
                errors.append(f"Field '{field}' cannot be empty")

        return errors

    @staticmethod
    def validate_pagination(page, per_page, max_per_page=100):
        """
        Validate pagination parameters

        Args:
            page: Page number
            per_page: Items per page
            max_per_page: Maximum allowed items per page

        Returns:
            Tuple of (validated_page, validated_per_page, errors)
        """
        errors = []

        # Validate page
        if page < 1:
            errors.append("Page number must be greater than 0")
            page = 1

        # Validate per_page
        if per_page < 1:
            errors.append("Per page must be greater than 0")
            per_page = 10
        elif per_page > max_per_page:
            errors.append(f"Per page cannot exceed {max_per_page}")
            per_page = max_per_page

        return page, per_page, errors

    @staticmethod
    def validate_coordinates(latitude, longitude):
        """
        Validate latitude and longitude coordinates

        Args:
            latitude: Latitude value
            longitude: Longitude value

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        if latitude is None:
            errors.append("Latitude is required")
        elif not isinstance(latitude, (int, float)):
            errors.append("Latitude must be a number")
        elif not -90 <= latitude <= 90:
            errors.append("Latitude must be between -90 and 90")

        if longitude is None:
            errors.append("Longitude is required")
        elif not isinstance(longitude, (int, float)):
            errors.append("Longitude must be a number")
        elif not -180 <= longitude <= 180:
            errors.append("Longitude must be between -180 and 180")

        return errors
