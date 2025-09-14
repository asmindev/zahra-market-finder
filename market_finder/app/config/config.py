import os
import pymysql
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = (
        os.environ.get("SECRET_KEY") or "dev-secret-key-for-jwt-market-finder-2024"
    )
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    MYSQL_HOST = os.environ.get("MYSQL_HOST") or "localhost"
    MYSQL_USER = os.environ.get("MYSQL_USER") or "root"
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD") or ""
    MYSQL_DB = os.environ.get("MYSQL_DB") or "market_finder"

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    )

    # run mysql, create database market_finder if it does not exist
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @classmethod
    def create_database_if_not_exists(cls):
        """Create database if it doesn't exist"""
        try:
            # Connect to MySQL without specifying database
            connection = pymysql.connect(
                host=cls.MYSQL_HOST,
                user=cls.MYSQL_USER,
                password=cls.MYSQL_PASSWORD,
                charset="utf8mb4",
            )

            cursor = connection.cursor()

            # Check if database exists
            cursor.execute(f"SHOW DATABASES LIKE '{cls.MYSQL_DB}'")
            result = cursor.fetchone()

            if not result:
                # Create database
                cursor.execute(
                    f"CREATE DATABASE {cls.MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
                print(f"✅ Database '{cls.MYSQL_DB}' created successfully")
            else:
                print(f"✅ Database '{cls.MYSQL_DB}' already exists")

            cursor.close()
            connection.close()
            return True

        except pymysql.Error as e:
            print(f"❌ MySQL Error: {e}")
            print("Make sure MySQL server is running and credentials are correct")
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
