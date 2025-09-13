import os
import sys

# detect virtual environment is activated
if "VIRTUAL_ENV" not in os.environ:
    print(
        "❌ Virtual environment is not activated. Please activate it before running the script."
    )
    sys.exit(1)

from app import create_app, db
from app.models import Market, User
from app.config.config import config
from flask_migrate import upgrade


def deploy():
    """Run deployment tasks."""
    app = create_app(os.getenv("FLASK_CONFIG") or "default")

    with app.app_context():
        # Create database tables
        db.create_all()

        # Migrate database to latest revision
        upgrade()


if __name__ == "__main__":
    # Create database if it doesn't exist
    config_name = os.getenv("FLASK_CONFIG") or "default"
    config_class = config[config_name]

    print("🗄️  Checking database setup...")
    if config_class.create_database_if_not_exists():
        print("✅ Database is ready")
    else:
        print("❌ Database setup failed - please check MySQL configuration")
        exit(1)

    app = create_app(config_name)

    @app.route("/")
    def index():
        return {
            "message": "Welcome to Market Finder API",
            "version": "1.0.0",
            "endpoints": {"markets": "/api/markets", "auth": "/api/auth"},
        }

    print("🚀 Starting Market Finder API...")
    print("📡 API available at: http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
