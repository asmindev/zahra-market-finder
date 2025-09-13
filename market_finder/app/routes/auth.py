from flask import Blueprint, request, jsonify
from app.services.user import UserService
from app.utils.response import APIResponse
from app.utils.auth import token_required, admin_required, get_current_user

# Create Blueprint
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Admin login"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["username", "password"]
        validation_errors = []

        for field in required_fields:
            if field not in data or not data[field]:
                validation_errors.append(f"Field '{field}' is required")

        if validation_errors:
            return APIResponse.validation_error(validation_errors)

        user = UserService.authenticate_user(data["username"], data["password"])

        if not user:
            return APIResponse.error("Invalid username or password", 401)

        # Check if user is admin
        if not user.is_admin:
            return APIResponse.error("Admin access required", 403)

        # Generate JWT token
        token = user.generate_token()

        response_data = {"user": user.to_dict(), "token": token}

        return APIResponse.success(response_data, "Login successful", 200)

    except Exception as e:
        return APIResponse.internal_error(f"Login failed: {str(e)}")


@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        current_user = get_current_user()
        return APIResponse.success(current_user.to_dict())

    except Exception as e:
        return APIResponse.internal_error(f"Failed to get profile: {str(e)}")


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    """Update current user profile"""
    try:
        data = request.get_json()
        current_user = get_current_user()

        user = UserService.update_user(current_user.id, data)

        if not user:
            return APIResponse.not_found("User")

        return APIResponse.success(user.to_dict(), "Profile updated successfully")

    except Exception as e:
        return APIResponse.internal_error(f"Failed to update profile: {str(e)}")


@auth_bp.route("/verify", methods=["GET"])
@token_required
def verify_token():
    """Verify if token is valid and return user info"""
    try:
        current_user = get_current_user()
        return APIResponse.success(
            {"user": current_user.to_dict(), "is_authenticated": True}, "Token is valid"
        )

    except Exception as e:
        return APIResponse.internal_error(f"Token verification failed: {str(e)}")
