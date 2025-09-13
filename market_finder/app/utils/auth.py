from functools import wraps
from flask import request, jsonify, g
from app.models.user import User
from app.utils.response import APIResponse


def token_required(f):
    """Decorator to require JWT token"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return APIResponse.error(
                    "Invalid token format. Use: Bearer <token>", 401
                )

        if not token:
            return APIResponse.error("Token is missing", 401)

        # Verify token
        payload = User.verify_token(token)
        if payload is None:
            return APIResponse.error("Token is invalid or expired", 401)

        # Get user from database
        current_user = User.query.get(payload["user_id"])
        if not current_user or not current_user.is_active:
            return APIResponse.error("User not found or inactive", 401)

        g.current_user = current_user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator to require admin role"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return APIResponse.error(
                    "Invalid token format. Use: Bearer <token>", 401
                )

        if not token:
            return APIResponse.error("Token is missing", 401)

        # Verify token
        payload = User.verify_token(token)
        if payload is None:
            return APIResponse.error("Token is invalid or expired", 401)

        # Get user from database
        current_user = User.query.get(payload["user_id"])
        if not current_user or not current_user.is_active:
            return APIResponse.error("User not found or inactive", 401)

        # Check if user is admin
        if not current_user.is_admin:
            return APIResponse.error("Admin access required", 403)

        g.current_user = current_user
        return f(*args, **kwargs)

    return decorated


def get_current_user():
    """Helper function to get current user from g object"""
    return getattr(g, "current_user", None)
