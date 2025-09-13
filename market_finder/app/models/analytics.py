from app import db
from datetime import datetime


class VisitorSession(db.Model):
    """Track visitor sessions and device information"""

    __tablename__ = "visitor_sessions"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)  # Support IPv6
    user_agent = db.Column(db.Text, nullable=True)
    device_type = db.Column(db.String(20), nullable=False)  # mobile, desktop, tablet
    browser = db.Column(db.String(50), nullable=True)
    operating_system = db.Column(db.String(50), nullable=True)
    screen_resolution = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "device_type": self.device_type,
            "browser": self.browser,
            "operating_system": self.operating_system,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_activity": (
                self.last_activity.isoformat() if self.last_activity else None
            ),
            "is_active": self.is_active,
        }


class SearchActivity(db.Model):
    """Track search activities and popular searches"""

    __tablename__ = "search_activities"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    search_query = db.Column(db.String(255), nullable=True)
    search_location = db.Column(db.String(255), nullable=True)  # User's location
    market_id = db.Column(
        db.Integer, nullable=True
    )  # If user clicked on a specific market
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    results_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "search_query": self.search_query,
            "search_location": self.search_location,
            "market_id": self.market_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "results_count": self.results_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PageView(db.Model):
    """Track page views for analytics"""

    __tablename__ = "page_views"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    page_url = db.Column(db.String(255), nullable=False)
    page_title = db.Column(db.String(255), nullable=True)
    referrer = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # Time spent on page in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "page_url": self.page_url,
            "page_title": self.page_title,
            "referrer": self.referrer,
            "duration": self.duration,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MarketPopularity(db.Model):
    """Track market popularity metrics"""

    __tablename__ = "market_popularity"

    id = db.Column(db.Integer, primary_key=True)
    market_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    search_count = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    click_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "market_id": self.market_id,
            "date": self.date.isoformat() if self.date else None,
            "search_count": self.search_count,
            "view_count": self.view_count,
            "click_count": self.click_count,
        }


class SystemMetrics(db.Model):
    """Track system performance metrics"""

    __tablename__ = "system_metrics"

    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
