from flask import Blueprint, request, jsonify
from app.services.user import UserService

# Create Blueprint
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register new user"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["username", "email", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return (
                    jsonify({"success": False, "error": f"Field {field} is required"}),
                    400,
                )

        # Check if username already exists
        existing_user = UserService.get_user_by_username(data["username"])
        if existing_user:
            return jsonify({"success": False, "error": "Username already exists"}), 400

        # Check if email already exists
        existing_email = UserService.get_user_by_email(data["email"])
        if existing_email:
            return jsonify({"success": False, "error": "Email already exists"}), 400

        user = UserService.create_user(data)

        return (
            jsonify(
                {
                    "success": True,
                    "data": user.to_dict(),
                    "message": "User registered successfully",
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """User login"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["username", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return (
                    jsonify({"success": False, "error": f"Field {field} is required"}),
                    400,
                )

        user = UserService.authenticate_user(data["username"], data["password"])

        if not user:
            return (
                jsonify({"success": False, "error": "Invalid username or password"}),
                401,
            )

        return (
            jsonify(
                {"success": True, "data": user.to_dict(), "message": "Login successful"}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    """Get user profile"""
    try:
        user = UserService.get_user_by_id(user_id)

        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        return jsonify({"success": True, "data": user.to_dict()}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    """Update user profile"""
    try:
        data = request.get_json()

        user = UserService.update_user(user_id, data)

        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        return (
            jsonify(
                {
                    "success": True,
                    "data": user.to_dict(),
                    "message": "Profile updated successfully",
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
