import { useState, useEffect } from "react";

const API_BASE_URL =
    import.meta.env.VITE_BASE_API_URL || "http://localhost:8000";

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
        todaySearches: 0,
        popularMarket: null,
        recentActivities: [],
        marketsByCategory: {},
        systemHealth: {
            apiStatus: "online",
            dbStatus: "connected",
            avgResponseTime: "145ms",
            errorRate: "0.2%",
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch markets data for statistics
            const marketsData = await fetchDashboardAPI(
                "/api/markets/?per_page=100"
            );

            if (marketsData.success && marketsData.data) {
                const markets = marketsData.data;

                // Calculate category distribution
                const categoryCount = {};
                markets.forEach((market) => {
                    const category = market.category || "Umum";
                    categoryCount[category] =
                        (categoryCount[category] || 0) + 1;
                });

                // Find most popular market (first one for now, would be based on search frequency in real app)
                const popularMarket = markets.length > 0 ? markets[0] : null;

                // Generate mock recent activities based on real data
                const recentActivities = [
                    {
                        id: 1,
                        type: "market_added",
                        description: `Pasar ${
                            markets[0]?.name || "Baru"
                        } ditambahkan`,
                        time: "2 jam yang lalu",
                        icon: "MapPin",
                    },
                    {
                        id: 2,
                        type: "search",
                        description: "Pencarian baru dari Jakarta Selatan",
                        time: "3 jam yang lalu",
                        icon: "Search",
                    },
                    {
                        id: 3,
                        type: "market_updated",
                        description: `Informasi ${
                            markets[1]?.name || "Pasar"
                        } diperbarui`,
                        time: "5 jam yang lalu",
                        icon: "Activity",
                    },
                ].filter(
                    (activity) =>
                        activity.description.includes("undefined") === false
                );

                setStats({
                    totalMarkets: markets.length,
                    todaySearches: Math.floor(Math.random() * 100) + 50, // Mock data
                    popularMarket,
                    recentActivities,
                    marketsByCategory: categoryCount,
                    systemHealth: {
                        apiStatus: "online",
                        dbStatus: "connected",
                        avgResponseTime: "145ms",
                        errorRate: "0.2%",
                    },
                });
            }
        } catch (err) {
            setError(err.message);
            // Set fallback data
            setStats((prev) => ({
                ...prev,
                totalMarkets: 0,
                todaySearches: 0,
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
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
        apiStatus: "checking",
        dbStatus: "checking",
        avgResponseTime: "...",
        errorRate: "...",
        lastChecked: new Date().toISOString(),
    });

    const checkHealth = async () => {
        try {
            const startTime = Date.now();

            // Try to fetch a simple endpoint to check API health
            await fetchDashboardAPI("/api/markets/?per_page=1");

            const responseTime = Date.now() - startTime;

            setHealth({
                apiStatus: "online",
                dbStatus: "connected",
                avgResponseTime: `${responseTime}ms`,
                errorRate: "0.2%", // Mock data
                lastChecked: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Health check failed:", err);
            setHealth((prev) => ({
                ...prev,
                apiStatus: "offline",
                dbStatus: "disconnected",
                lastChecked: new Date().toISOString(),
            }));
        }
    };

    useEffect(() => {
        checkHealth();

        // Check health every 5 minutes
        const interval = setInterval(checkHealth, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        health,
        checkHealth,
    };
};
