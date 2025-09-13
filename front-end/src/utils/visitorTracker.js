import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const API_BASE_URL =
    import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

class VisitorTracker {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.startTime = Date.now();
        this.lastActivity = Date.now();
        this.pageViews = [];
        this.isTracking = false;
    }

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem("visitor_session_id");
        if (!sessionId) {
            sessionId = uuidv4();
            sessionStorage.setItem("visitor_session_id", sessionId);
        }
        return sessionId;
    }

    detectDevice() {
        const userAgent = navigator.userAgent;

        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return "tablet";
        }
        if (
            /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
                userAgent
            )
        ) {
            return "mobile";
        }
        return "desktop";
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = "Unknown";

        if (userAgent.includes("Chrome")) browser = "Chrome";
        else if (userAgent.includes("Firefox")) browser = "Firefox";
        else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
            browser = "Safari";
        else if (userAgent.includes("Edge")) browser = "Edge";
        else if (userAgent.includes("Opera")) browser = "Opera";

        return browser;
    }

    getOperatingSystem() {
        const userAgent = navigator.userAgent;
        let os = "Unknown";

        if (userAgent.includes("Windows")) os = "Windows";
        else if (userAgent.includes("Mac")) os = "macOS";
        else if (userAgent.includes("Linux")) os = "Linux";
        else if (userAgent.includes("Android")) os = "Android";
        else if (userAgent.includes("iOS")) os = "iOS";

        return os;
    }

    getScreenResolution() {
        return `${screen.width}x${screen.height}`;
    }

    async initializeSession() {
        if (this.isTracking) return;

        try {
            const sessionData = {
                session_id: this.sessionId,
                ip_address: "client", // Will be determined by server
                user_agent: navigator.userAgent,
                device_type: this.detectDevice(),
                browser: this.getBrowserInfo(),
                operating_system: this.getOperatingSystem(),
                screen_resolution: this.getScreenResolution(),
            };

            const response = await fetch(
                `${API_BASE_URL}/api/analytics/track-session`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sessionData),
                }
            );

            if (response.ok) {
                this.isTracking = true;
                this.setupEventListeners();
            }
        } catch (error) {
            console.error("Failed to initialize visitor tracking:", error);
        }
    }

    async trackPageView(url, title = "") {
        if (!this.isTracking) return;

        try {
            const pageViewData = {
                session_id: this.sessionId,
                page_url: url,
                page_title: title,
                referrer: document.referrer,
            };

            await fetch(`${API_BASE_URL}/api/analytics/track-pageview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pageViewData),
            });

            this.pageViews.push({
                url,
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error("Failed to track page view:", error);
        }
    }

    async trackSearch(query, location, results = []) {
        if (!this.isTracking) return;

        try {
            const searchData = {
                session_id: this.sessionId,
                search_query: query,
                search_location: location,
                results_count: results.length,
                latitude: null, // Could be added with geolocation
                longitude: null,
            };

            await fetch(`${API_BASE_URL}/api/analytics/track-search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(searchData),
            });
        } catch (error) {
            console.error("Failed to track search:", error);
        }
    }

    async trackMarketClick(marketId) {
        if (!this.isTracking) return;

        try {
            const clickData = {
                session_id: this.sessionId,
                market_id: marketId,
                action: "click",
            };

            await fetch(
                `${API_BASE_URL}/api/analytics/track-market-interaction`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clickData),
                }
            );
        } catch (error) {
            console.error("Failed to track market click:", error);
        }
    }

    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.updateLastActivity();
            }
        });

        // Track when user is leaving the page
        window.addEventListener("beforeunload", () => {
            this.updateLastActivity();
        });

        // Update activity every 30 seconds
        setInterval(() => {
            this.updateLastActivity();
        }, 30000);
    }

    async updateLastActivity() {
        if (!this.isTracking) return;

        try {
            await fetch(`${API_BASE_URL}/api/analytics/update-activity`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    last_activity: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error("Failed to update activity:", error);
        }
    }
}

// Create global instance
const visitorTracker = new VisitorTracker();

// React hook for visitor tracking
export const useVisitorTracking = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeTracking = async () => {
            await visitorTracker.initializeSession();
            setIsInitialized(true);
        };

        initializeTracking();
    }, []);

    const trackPageView = (url, title) => {
        if (isInitialized) {
            visitorTracker.trackPageView(url, title);
        }
    };

    const trackSearch = (query, location, results) => {
        if (isInitialized) {
            visitorTracker.trackSearch(query, location, results);
        }
    };

    const trackMarketClick = (marketId) => {
        if (isInitialized) {
            visitorTracker.trackMarketClick(marketId);
        }
    };

    return {
        isInitialized,
        trackPageView,
        trackSearch,
        trackMarketClick,
        sessionId: visitorTracker.sessionId,
    };
};

export default visitorTracker;
