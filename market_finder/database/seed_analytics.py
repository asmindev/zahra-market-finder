import os
import sys
import random
from datetime import datetime, timedelta
from uuid import uuid4

# Tambahkan root directory ke path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.analytics import (
    VisitorSession,
    SearchActivity,
    PageView,
    MarketPopularity,
)
from app.models.market import Market


def create_dummy_analytics_data():
    """Create dummy analytics data for testing dashboard"""

    app = create_app("default")

    with app.app_context():
        print("🔄 Creating dummy analytics data...")

        # Get existing markets
        markets = Market.query.all()
        if not markets:
            print("❌ No markets found. Please seed markets first.")
            return

        # Create visitor sessions for the last 30 days
        devices = ["mobile", "desktop", "tablet"]
        browsers = ["Chrome", "Firefox", "Safari", "Edge"]
        operating_systems = ["Windows", "macOS", "Linux", "Android", "iOS"]

        sessions_created = 0
        searches_created = 0
        pageviews_created = 0

        for day in range(30):
            date = datetime.utcnow() - timedelta(days=day)

            # Create 10-50 sessions per day
            daily_sessions = random.randint(10, 50)

            for _ in range(daily_sessions):
                session_id = str(uuid4())

                # Create visitor session
                session = VisitorSession(
                    session_id=session_id,
                    ip_address=f"192.168.1.{random.randint(1, 254)}",
                    user_agent=f"Mozilla/5.0 (compatible; TestBot/1.0)",
                    device_type=random.choice(devices),
                    browser=random.choice(browsers),
                    operating_system=random.choice(operating_systems),
                    screen_resolution=random.choice(
                        ["1920x1080", "1366x768", "375x667", "414x896"]
                    ),
                    created_at=date,
                    last_activity=date + timedelta(minutes=random.randint(1, 60)),
                )

                db.session.add(session)
                sessions_created += 1

                # Create 1-5 page views per session
                page_views_count = random.randint(1, 5)
                pages = [
                    "/",
                    "/market",
                    "/about",
                    "/contact",
                    f"/market/{random.randint(1, len(markets))}",
                ]

                for pv in range(page_views_count):
                    page_view = PageView(
                        session_id=session_id,
                        page_url=random.choice(pages),
                        page_title=f"Market Finder - Page {pv}",
                        referrer="https://google.com" if pv == 0 else None,
                        duration=random.randint(30, 300),
                        created_at=date + timedelta(minutes=pv * 2),
                    )

                    db.session.add(page_view)
                    pageviews_created += 1

                # Create 0-3 searches per session
                searches_count = random.randint(0, 3)
                search_queries = [
                    "pasar terdekat",
                    "pasar tradisional",
                    "pasar modern",
                    "pasar murah",
                    "pasar sayur",
                    "pasar buah",
                    "pasar daging",
                ]

                for s in range(searches_count):
                    # Sometimes search for specific market
                    market_clicked = (
                        random.choice(markets) if random.random() < 0.3 else None
                    )

                    search = SearchActivity(
                        session_id=session_id,
                        search_query=random.choice(search_queries),
                        search_location=f"Jakarta {random.choice(['Selatan', 'Utara', 'Barat', 'Timur', 'Pusat'])}",
                        market_id=market_clicked.id if market_clicked else None,
                        latitude=-6.2 + random.uniform(-0.1, 0.1),
                        longitude=106.8 + random.uniform(-0.1, 0.1),
                        results_count=random.randint(1, 20),
                        created_at=date + timedelta(minutes=s * 10),
                    )

                    db.session.add(search)
                    searches_created += 1

        # Create market popularity data
        popularity_created = 0
        for market in markets:
            for day in range(30):
                date = datetime.utcnow() - timedelta(days=day)

                popularity = MarketPopularity(
                    market_id=market.id,
                    date=date.date(),
                    search_count=random.randint(0, 50),
                    view_count=random.randint(0, 100),
                    click_count=random.randint(0, 25),
                )

                db.session.add(popularity)
                popularity_created += 1

        # Commit all changes
        db.session.commit()

        print(f"✅ Created dummy analytics data:")
        print(f"   - {sessions_created} visitor sessions")
        print(f"   - {searches_created} search activities")
        print(f"   - {pageviews_created} page views")
        print(f"   - {popularity_created} market popularity records")
        print("🎉 Dummy data creation completed!")


if __name__ == "__main__":
    create_dummy_analytics_data()
