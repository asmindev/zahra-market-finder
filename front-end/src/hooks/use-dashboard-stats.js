import { useState, useEffect } from "react";

const API_BASE_URL =
    import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem("token");
};

// Generic fetch function for dashboard
const fetchDashboardAPI = async (endpoint) => {
    try {
        const token = getAuthToken();
        const headers = {
            "Content-Type": "application/json",
        };

        // Add authorization header if token exists
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Dashboard API Error:", error);
        throw error;
    }
};

export const useDashboardStats = () => {
    const [stats, setStats] = useState({
        totalMarkets: 0,
        todayVisitors: 0,
        todaySearches: 0,
        popularMarkets: [],
        recentActivities: [],
        marketsByCategory: {},
        deviceAnalytics: {
            total_sessions: 0,
            breakdown: {},
        },
        monthlyVisitors: {
            average_monthly: 0,
            monthly_data: [],
        },
        systemHealth: {
            api_status: "online",
            db_status: "connected",
            avg_response_time: "145ms",
            error_rate: "0.2%",
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch comprehensive dashboard analytics from new endpoint
            const analyticsData = await fetchDashboardAPI(
                "/api/analytics/dashboard"
            );

            if (analyticsData.success && analyticsData.data) {
                const data = analyticsData.data;

                // Transform the data to match our frontend structure
                setStats({
                    totalMarkets: data.total_markets || 0,
                    todayVisitors: data.today_visitors || 0,
                    todaySearches: data.today_searches || 0,
                    popularMarkets: data.popular_markets || [],
                    recentActivities: data.recent_activities || [],
                    marketsByCategory: data.markets_by_category || {},
                    deviceAnalytics: data.device_analytics || {
                        total_sessions: 0,
                        breakdown: {},
                    },
                    monthlyVisitors: data.monthly_visitors || {
                        average_monthly: 0,
                        monthly_data: [],
                    },
                    systemHealth: data.system_health || {
                        api_status: "online",
                        db_status: "connected",
                        avg_response_time: "145ms",
                        error_rate: "0.2%",
                    },
                });
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
            setError(err.message);
            // Set fallback data on error
            setStats((prev) => ({
                ...prev,
                totalMarkets: 0,
                todayVisitors: 0,
                todaySearches: 0,
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Refresh data every 30 seconds for real-time updates
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    const refetch = () => {
        fetchStats();
    };

    return {
        stats,
        loading,
        error,
        refetch,
    };
};

// Hook for system health monitoring
export const useSystemHealth = () => {
    const [health, setHealth] = useState({
        api_status: "checking",
        db_status: "checking",
        avg_response_time: "...",
        error_rate: "...",
        last_checked: new Date().toISOString(),
    });

    const checkHealth = async () => {
        try {
            // Use the dedicated system health endpoint
            const healthData = await fetchDashboardAPI(
                "/api/analytics/system-health"
            );

            if (healthData.success && healthData.data) {
                setHealth({
                    ...healthData.data,
                    last_checked: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error("Health check failed:", err);
            setHealth((prev) => ({
                ...prev,
                api_status: "offline",
                db_status: "disconnected",
                last_checked: new Date().toISOString(),
            }));
        }
    };

    useEffect(() => {
        checkHealth();

        // Check health every 2 minutes
        const interval = setInterval(checkHealth, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        health,
        checkHealth,
    };
};
