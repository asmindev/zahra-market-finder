#!/usr/bin/env python3
"""
Script to create admin user for Market Finder application
"""
from app import create_app, db
from app.models.user import User
from app.config.config import Config


def create_admin_user():
    """Create admin user"""
    # Create app context
    app = create_app()

    with app.app_context():
        try:
            # Check if admin already exists
            admin = User.query.filter_by(username="admin").first()
            if admin:
                print("✅ Admin user already exists")
                print(f"   Username: {admin.username}")
                print(f"   Email: {admin.email}")
                print(f"   Is Admin: {admin.is_admin}")
                return

            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@marketfinder.com",
                first_name="Admin",
                last_name="User",
                is_admin=True,
                is_active=True,
            )

            # Set password
            admin_user.set_password("admin123")

            # Save to database
            db.session.add(admin_user)
            db.session.commit()

            print("✅ Admin user created successfully!")
            print(f"   Username: admin")
            print(f"   Email: admin@marketfinder.com")
            print(f"   Password: admin123")
            print(f"   Is Admin: True")
            print("\n🔐 You can now login using these credentials")

        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            db.session.rollback()


if __name__ == "__main__":
    create_admin_user()
