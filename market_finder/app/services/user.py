from app import db
from app.models.user import User


class UserService:
    """Service class for User operations"""

    @staticmethod
    def create_user(data):
        """Create new user"""
        user = User(
            username=data.get("username"),
            email=data.get("email"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
        )
        user.set_password(data.get("password"))

        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user_by_username(username):
        """Get user by username"""
        return User.query.filter_by(username=username, is_active=True).first()

    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        return User.query.filter_by(email=email, is_active=True).first()

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.filter_by(id=user_id, is_active=True).first()

    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user"""
        user = User.query.filter_by(username=username, is_active=True).first()
        if user and user.check_password(password):
            return user
        return None

    @staticmethod
    def update_user(user_id, data):
        """Update user"""
        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return None

        # Update fields
        for key, value in data.items():
            if hasattr(user, key) and key not in ["id", "password_hash"]:
                setattr(user, key, value)

        # Handle password update separately
        if "password" in data:
            user.set_password(data["password"])

        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        """Soft delete user"""
        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return False

        user.is_active = False
        db.session.commit()
        return True
