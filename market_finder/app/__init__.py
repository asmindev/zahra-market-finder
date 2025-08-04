from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import config
from app.logging import setup_logging, get_logger

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

# Setup logging
setup_logging()
logger = get_logger(__name__)


def create_app(config_name="default"):
    """Application factory pattern"""
    app = Flask(__name__)

    logger.info(f"Creating Flask app with config: {config_name}")

    # Load configuration
    app.config.from_object(config[config_name])
    logger.info("Configuration loaded successfully")

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    logger.info("Extensions initialized successfully")

    # Register blueprints
    from app.routes.market import market_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(market_bp, url_prefix="/api/markets")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    logger.info("Blueprints registered successfully")

    logger.info("Flask application created successfully")
    return app

    # Register error handlers
    register_error_handlers(app)

    return app


def register_error_handlers(app):
    """Register error handlers"""

    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(400)
    def bad_request(error):
        return {"error": "Bad request"}, 400

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
