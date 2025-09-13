from flask import Blueprint, jsonify, request
from app.utils.auth import token_required
from app.utils.response import APIResponse
from app.services.analytics import DashboardAnalyticsService
from app.models.analytics import (
    VisitorSession,
    SearchActivity,
    PageView,
    MarketPopularity,
)
from app import db
from datetime import datetime
import logging

api_logger = logging.getLogger(__name__)
analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/api/analytics/dashboard", methods=["GET"])
@token_required
def get_dashboard_analytics():
    """
    Get comprehensive dashboard analytics
    ---
    tags:
      - Analytics
    security:
      - Bearer: []
    responses:
      200:
        description: Dashboard analytics data
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: object
              properties:
                total_markets:
                  type: integer
                today_visitors:
                  type: integer
                today_searches:
                  type: integer
                device_analytics:
                  type: object
                monthly_visitors:
                  type: object
                popular_markets:
                  type: array
                recent_activities:
                  type: array
                system_health:
                  type: object
                markets_by_category:
                  type: object
    """
    try:
        from flask import g

        current_user = g.current_user
        api_logger.info(f"Dashboard analytics requested by user {current_user.id}")

        stats = DashboardAnalyticsService.get_dashboard_stats()

        return APIResponse.success(
            data=stats, message="Dashboard analytics retrieved successfully"
        )

    except Exception as e:
        api_logger.error(f"Error getting dashboard analytics: {str(e)}")
        return APIResponse.internal_error(
            message="Failed to retrieve dashboard analytics"
        )


@analytics_bp.route("/api/analytics/visitors", methods=["GET"])
@token_required
def get_visitor_analytics():
    """
    Get detailed visitor analytics
    ---
    tags:
      - Analytics
    security:
      - Bearer: []
    responses:
      200:
        description: Visitor analytics data
    """
    try:
        data = {
            "today_visitors": DashboardAnalyticsService.get_today_visitors(),
            "device_analytics": DashboardAnalyticsService.get_device_analytics(),
            "monthly_visitors": DashboardAnalyticsService.get_monthly_visitors(),
        }

        return APIResponse.success(
            data=data, message="Visitor analytics retrieved successfully"
        )

    except Exception as e:
        api_logger.error(f"Error getting visitor analytics: {str(e)}")
        return APIResponse.internal_error(
            message="Failed to retrieve visitor analytics"
        )


@analytics_bp.route("/api/analytics/searches", methods=["GET"])
@token_required
def get_search_analytics():
    """
    Get search analytics and popular markets
    ---
    tags:
      - Analytics
    security:
      - Bearer: []
    responses:
      200:
        description: Search analytics data
    """
    try:
        data = {
            "today_searches": DashboardAnalyticsService.get_today_searches(),
            "popular_markets": DashboardAnalyticsService.get_most_searched_markets(),
        }

        return APIResponse.success(
            data=data, message="Search analytics retrieved successfully"
        )

    except Exception as e:
        api_logger.error(f"Error getting search analytics: {str(e)}")
        return APIResponse.internal_error(message="Failed to retrieve search analytics")


@analytics_bp.route("/api/analytics/system-health", methods=["GET"])
@token_required
def get_system_health():
    """
    Get system health metrics
    ---
    tags:
      - Analytics
    security:
      - Bearer: []
    responses:
      200:
        description: System health data
    """
    try:
        health = DashboardAnalyticsService.get_system_health()

        return APIResponse.success(
            data=health, message="System health retrieved successfully"
        )

    except Exception as e:
        api_logger.error(f"Error getting system health: {str(e)}")
        return APIResponse.internal_error(message="Failed to retrieve system health")


@analytics_bp.route("/api/analytics/activities", methods=["GET"])
@token_required
def get_recent_activities():
    """
    Get recent system activities
    ---
    tags:
      - Analytics
    security:
      - Bearer: []
    parameters:
      - name: limit
        in: query
        type: integer
        default: 10
        description: Number of activities to return
    responses:
      200:
        description: Recent activities data
    """
    try:
        limit = request.args.get("limit", 10, type=int)
        activities = DashboardAnalyticsService.get_recent_activities(limit=limit)

        return APIResponse.success(
            data=activities, message="Recent activities retrieved successfully"
        )

    except Exception as e:
        api_logger.error(f"Error getting recent activities: {str(e)}")
        return APIResponse.internal_error(
            message="Failed to retrieve recent activities"
        )


@analytics_bp.route("/api/analytics/track-session", methods=["POST"])
def track_visitor_session():
    """
    Track visitor session
    ---
    tags:
      - Analytics
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            session_id:
              type: string
            user_agent:
              type: string
            device_type:
              type: string
            browser:
              type: string
            operating_system:
              type: string
            screen_resolution:
              type: string
    responses:
      200:
        description: Session tracked successfully
    """
    try:
        data = request.get_json()

        # Get client IP
        client_ip = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)

        # Check if session already exists
        existing_session = VisitorSession.query.filter_by(
            session_id=data.get("session_id")
        ).first()

        if not existing_session:
            # Create new session
            session = VisitorSession(
                session_id=data.get("session_id"),
                ip_address=client_ip,
                user_agent=data.get("user_agent"),
                device_type=data.get("device_type"),
                browser=data.get("browser"),
                operating_system=data.get("operating_system"),
                screen_resolution=data.get("screen_resolution"),
            )

            db.session.add(session)
            db.session.commit()

            api_logger.info(f"New visitor session created: {session.session_id}")
        else:
            # Update existing session
            existing_session.last_activity = datetime.utcnow()
            db.session.commit()

        return APIResponse.success(
            data={"session_id": data.get("session_id")},
            message="Session tracked successfully",
        )

    except Exception as e:
        api_logger.error(f"Error tracking session: {str(e)}")
        return APIResponse.internal_error(message="Failed to track session")


@analytics_bp.route("/api/analytics/track-pageview", methods=["POST"])
def track_page_view():
    """Track page view"""
    try:
        data = request.get_json()

        page_view = PageView(
            session_id=data.get("session_id"),
            page_url=data.get("page_url"),
            page_title=data.get("page_title"),
            referrer=data.get("referrer"),
        )

        db.session.add(page_view)
        db.session.commit()

        return APIResponse.success(message="Page view tracked successfully")

    except Exception as e:
        api_logger.error(f"Error tracking page view: {str(e)}")
        return APIResponse.internal_error(message="Failed to track page view")


@analytics_bp.route("/api/analytics/track-search", methods=["POST"])
def track_search_activity():
    """Track search activity"""
    try:
        data = request.get_json()

        search = SearchActivity(
            session_id=data.get("session_id"),
            search_query=data.get("search_query"),
            search_location=data.get("search_location"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            results_count=data.get("results_count", 0),
        )

        db.session.add(search)
        db.session.commit()

        return APIResponse.success(message="Search activity tracked successfully")

    except Exception as e:
        api_logger.error(f"Error tracking search: {str(e)}")
        return APIResponse.internal_error(message="Failed to track search")


@analytics_bp.route("/api/analytics/track-market-interaction", methods=["POST"])
def track_market_interaction():
    """Track market interaction (click, view, etc.)"""
    try:
        data = request.get_json()

        # Update search activity with market interaction
        search = SearchActivity(
            session_id=data.get("session_id"),
            market_id=data.get("market_id"),
            search_query="Market Click",
        )

        db.session.add(search)
        db.session.commit()

        return APIResponse.success(message="Market interaction tracked successfully")

    except Exception as e:
        api_logger.error(f"Error tracking market interaction: {str(e)}")
        return APIResponse.internal_error(message="Failed to track market interaction")


@analytics_bp.route("/api/analytics/update-activity", methods=["POST"])
def update_last_activity():
    """Update last activity timestamp for session"""
    try:
        data = request.get_json()

        session = VisitorSession.query.filter_by(
            session_id=data.get("session_id")
        ).first()

        if session:
            session.last_activity = datetime.utcnow()
            db.session.commit()

        return APIResponse.success(message="Activity updated successfully")

    except Exception as e:
        api_logger.error(f"Error updating activity: {str(e)}")
        return APIResponse.internal_error(message="Failed to update activity")
