import logging
import logging.config
import os
from datetime import datetime
from pathlib import Path


class RelativePathFilter(logging.Filter):
    """Filter to show relative path from project root"""

    def filter(self, record):
        # Get the pathname and make it relative to project root
        pathname = record.pathname
        project_root = (
            Path(__file__).resolve().parent.parent
        )  # Assuming this file is in app/logging
        record.relative_path = os.path.relpath(pathname, project_root)
        return True


def setup_logging():
    """Setup logging configuration for the application"""

    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    os.makedirs(logs_dir, exist_ok=True)

    # Logging configuration
    LOGGING_CONFIG = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s %(levelname)s - %(relative_path)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s %(levelname)s [%(name)s:%(lineno)d] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "api": {
                "format": "%(asctime)s API %(levelname)s [%(name)s] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "default",
                "filters": ["relative_path_filter"],
                "stream": "ext://sys.stdout",
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "DEBUG",
                "formatter": "detailed",
                "filters": ["relative_path_filter"],
                "filename": os.path.join(logs_dir, "app.log"),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
            "api_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "api",
                "filename": os.path.join(logs_dir, "api.log"),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": os.path.join(logs_dir, "error.log"),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
        },
        "filters": {
            "relative_path_filter": {
                "()": RelativePathFilter,
            }
        },
        "loggers": {
            "app.routes": {
                "level": "INFO",
                "handlers": ["console", "api_file", "error_file"],
                "propagate": False,
            },
            "app.services": {
                "level": "DEBUG",
                "handlers": ["console", "file", "error_file"],
                "propagate": False,
            },
            "app.models": {
                "level": "DEBUG",
                "handlers": ["console", "file", "error_file"],
                "propagate": False,
            },
        },
        "root": {"level": "INFO", "handlers": ["console", "file"]},
    }

    logging.config.dictConfig(LOGGING_CONFIG)

    # Log application startup
    root_logger = logging.getLogger()
    root_logger.info("=" * 50)
    root_logger.info("Market Finder Application Started")
    root_logger.info(f"Timestamp: {datetime.now().isoformat()}")
    root_logger.info("=" * 50)


def get_logger(name):
    """Get a logger instance with the specified name"""
    return logging.getLogger(name)
