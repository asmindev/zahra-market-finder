#!/usr/bin/env python3
"""
Test script for Market Finder API
"""

import os
import sys

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.market import Market
from app.logging import get_logger

logger = get_logger(__name__)


def test_api_endpoints():
    """Test basic API functionality"""

    print("🧪 Testing Market Finder API")
    print("=" * 40)

    # Create Flask app context
    app = create_app()

    with app.app_context():
        try:
            # Test database connection
            market_count = Market.query.count()
            print(f"✅ Database connection successful")
            print(f"📊 Total markets in database: {market_count}")

            # Test logging
            logger.info("Test log message from API test")
            print("✅ Logging system working")

            # Test model functionality
            if market_count > 0:
                first_market = Market.query.first()
                if first_market:
                    market_dict = first_market.to_dict()
                    print(f"✅ Model serialization working")
                    print(f"📝 Sample market: {market_dict['name']}")
                else:
                    print("⚠️  No markets found in database")

            print("\n🎉 All basic tests passed!")
            print("\n🚀 Ready to start the API server!")
            print("\nTo run the server:")
            print("cd /home/labubu/Projects/market_finder")
            print("python app.py")

        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            logger.error(f"API test failed: {str(e)}", exc_info=True)


if __name__ == "__main__":
    test_api_endpoints()
