from datetime import datetime, timedelta, date
from sqlalchemy import func, desc, and_
from app.models.analytics import (
    VisitorSession,
    SearchActivity,
    PageView,
    MarketPopularity,
)
from app.models.market import Market
from app import db


class DashboardAnalyticsService:

    @staticmethod
    def get_total_markets():
        """Get total number of active markets"""
        return Market.query.filter_by(is_active=True).count()

    @staticmethod
    def get_today_visitors():
        """Get number of unique visitors today"""
        today = date.today()
        return VisitorSession.query.filter(
            func.date(VisitorSession.created_at) == today
        ).count()

    @staticmethod
    def get_today_searches():
        """Get number of searches performed today"""
        today = date.today()
        return SearchActivity.query.filter(
            func.date(SearchActivity.created_at) == today
        ).count()

    @staticmethod
    def get_device_analytics():
        """Get device type analytics for the last 30 days"""
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        device_stats = (
            db.session.query(
                VisitorSession.device_type, func.count(VisitorSession.id).label("count")
            )
            .filter(VisitorSession.created_at >= thirty_days_ago)
            .group_by(VisitorSession.device_type)
            .all()
        )

        total = sum([stat.count for stat in device_stats])

        return {
            "total_sessions": total,
            "breakdown": {
                stat.device_type: {
                    "count": stat.count,
                    "percentage": (
                        round((stat.count / total * 100), 1) if total > 0 else 0
                    ),
                }
                for stat in device_stats
            },
        }

    @staticmethod
    def get_monthly_visitors():
        """Get monthly visitor statistics for the last 12 months"""
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)

        # Use MySQL DATE_FORMAT function instead of PostgreSQL date_trunc
        monthly_stats = (
            db.session.query(
                func.date_format(VisitorSession.created_at, "%Y-%m").label("month"),
                func.count(VisitorSession.id).label("visitors"),
            )
            .filter(VisitorSession.created_at >= twelve_months_ago)
            .group_by(func.date_format(VisitorSession.created_at, "%Y-%m"))
            .order_by("month")
            .all()
        )

        # Calculate average
        total_visitors = sum([stat.visitors for stat in monthly_stats])
        avg_monthly = round(total_visitors / len(monthly_stats)) if monthly_stats else 0

        return {
            "average_monthly": avg_monthly,
            "monthly_data": [
                {"month": stat.month, "visitors": stat.visitors}
                for stat in monthly_stats
            ],
        }

    @staticmethod
    def get_most_searched_markets():
        """Get most searched markets in the last 30 days"""
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        popular_markets = (
            db.session.query(
                SearchActivity.market_id,
                Market.name,
                Market.location,
                func.count(SearchActivity.id).label("search_count"),
            )
            .join(Market, SearchActivity.market_id == Market.id)
            .filter(
                and_(
                    SearchActivity.created_at >= thirty_days_ago,
                    SearchActivity.market_id.isnot(None),
                )
            )
            .group_by(SearchActivity.market_id, Market.name, Market.location)
            .order_by(desc("search_count"))
            .limit(5)
            .all()
        )

        return [
            {
                "market_id": market.market_id,
                "name": market.name,
                "location": market.location,
                "search_count": market.search_count,
            }
            for market in popular_markets
        ]

    @staticmethod
    def get_recent_activities(limit=10):
        """Get recent system activities"""
        activities = []

        # Recent searches
        recent_searches = (
            SearchActivity.query.filter(
                SearchActivity.created_at >= datetime.utcnow() - timedelta(hours=24)
            )
            .order_by(desc(SearchActivity.created_at))
            .limit(5)
            .all()
        )

        for search in recent_searches:
            activities.append(
                {
                    "id": f"search_{search.id}",
                    "type": "search",
                    "description": f'Pencarian baru: "{search.search_query or "Lokasi terdekat"}"',
                    "time": DashboardAnalyticsService._time_ago(search.created_at),
                    "icon": "Search",
                }
            )

        # Recent visitors
        recent_visitors = (
            VisitorSession.query.filter(
                VisitorSession.created_at >= datetime.utcnow() - timedelta(hours=24)
            )
            .order_by(desc(VisitorSession.created_at))
            .limit(3)
            .all()
        )

        for visitor in recent_visitors:
            activities.append(
                {
                    "id": f"visitor_{visitor.id}",
                    "type": "visitor",
                    "description": f"Pengunjung baru dari {visitor.device_type}",
                    "time": DashboardAnalyticsService._time_ago(visitor.created_at),
                    "icon": "Activity",
                }
            )

        # Sort by time and limit
        activities.sort(key=lambda x: x["time"])
        return activities[:limit]

    @staticmethod
    def get_system_health():
        """Get system health metrics"""
        try:
            # Test database connection
            db.session.execute(db.text("SELECT 1"))
            db_status = "connected"
        except Exception as e:
            print(f"Database connection error: {e}")
            db_status = "disconnected"

        return {
            "api_status": "online",
            "db_status": db_status,
            "avg_response_time": "145ms",  # This could be calculated from actual metrics
            "error_rate": "0.2%",
            "last_checked": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def get_category_distribution():
        """Get market distribution by category"""
        category_stats = (
            db.session.query(Market.category, func.count(Market.id).label("count"))
            .filter(Market.is_active == True)
            .group_by(Market.category)
            .all()
        )

        return {
            stat.category.value if stat.category else "umum": stat.count
            for stat in category_stats
        }

    @staticmethod
    def _time_ago(timestamp):
        """Helper function to convert timestamp to 'time ago' format"""
        if not timestamp:
            return "Unknown"

        now = datetime.utcnow()
        diff = now - timestamp

        if diff.days > 0:
            return f"{diff.days} hari yang lalu"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} jam yang lalu"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} menit yang lalu"
        else:
            return "Baru saja"

    @staticmethod
    def get_dashboard_stats():
        """Get all dashboard statistics in one call"""
        return {
            "total_markets": DashboardAnalyticsService.get_total_markets(),
            "today_visitors": DashboardAnalyticsService.get_today_visitors(),
            "today_searches": DashboardAnalyticsService.get_today_searches(),
            "device_analytics": DashboardAnalyticsService.get_device_analytics(),
            "monthly_visitors": DashboardAnalyticsService.get_monthly_visitors(),
            "popular_markets": DashboardAnalyticsService.get_most_searched_markets(),
            "recent_activities": DashboardAnalyticsService.get_recent_activities(),
            "system_health": DashboardAnalyticsService.get_system_health(),
            "markets_by_category": DashboardAnalyticsService.get_category_distribution(),
        }
