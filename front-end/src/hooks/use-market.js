import { useState, useEffect } from "react";

// Base API URL - sesuaikan dengan backend Anda
const API_BASE_URL =
    import.meta.env.VITE_BASE_API_URL || "http://localhost:8000";

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem("token");
};

// Generic fetch function with error handling
const fetchAPI = async (endpoint, options = {}) => {
    try {
        const token = getAuthToken();
        const headers = {
            ...options.headers,
        };

        // Add Content-Type only if it's not multipart form data
        if (!options.isMultipart) {
            headers["Content-Type"] = "application/json";
        }

        // Add authorization header if token exists
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            ...options,
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Sesi telah berakhir. Silakan login kembali.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (response.status === 204) {
            return {
                success: true,
            };
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// Hook untuk mendapatkan semua markets dengan pagination
export const useMarkets = (params = {}) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    const { page = 1, per_page = 10, search = "", category = "" } = params;

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    per_page: per_page.toString(),
                    ...(search && { search }),
                    ...(category && { category }),
                }).toString();

                const data = await fetchAPI(`/api/markets/?${queryParams}`);

                setMarkets(data.data || []);

                // Map pagination from API response structure
                const paginationData = data.meta?.pagination || {};
                const mappedPagination = {
                    current_page: paginationData.current_page || page,
                    per_page: paginationData.per_page || per_page,
                    total: paginationData.total_items || 0,
                    total_pages: paginationData.total_pages || 0,
                };

                setPagination(mappedPagination);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, [page, per_page, search, category]);

    const refetch = () => {
        const fetchMarkets = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    per_page: per_page.toString(),
                    ...(search && { search }),
                    ...(category && { category }),
                }).toString();

                const data = await fetchAPI(`/api/markets/?${queryParams}`);

                setMarkets(data.data || []);

                // Map pagination from API response structure
                const paginationData = data.meta?.pagination || {};
                const mappedPagination = {
                    current_page: paginationData.current_page || page,
                    per_page: paginationData.per_page || per_page,
                    total: paginationData.total_items || 0,
                    total_pages: paginationData.total_pages || 0,
                };

                setPagination(mappedPagination);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    };

    return { markets, loading, error, pagination, refetch };
};

// Hook untuk mendapatkan market spesifik berdasarkan ID
export const useMarket = (id) => {
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchMarket = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchAPI(`/api/markets/${id}`);
                setMarket(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarket();
    }, [id]);

    const refetch = () => {
        if (!id) return;

        const fetchMarket = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchAPI(`/api/markets/${id}`);
                setMarket(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarket();
    };

    return { market, loading, error, refetch };
};

// Hook untuk operasi CRUD markets
export const useMarketMutations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create new market
    const createMarket = async (marketData) => {
        try {
            setLoading(true);
            setError(null);

            // Create FormData for multipart form submission
            const formData = new FormData();

            // Add market data fields
            Object.keys(marketData).forEach((key) => {
                if (
                    key !== "images" &&
                    key !== "deleteImages" &&
                    marketData[key] !== null &&
                    marketData[key] !== undefined
                ) {
                    formData.append(key, marketData[key]);
                }
            });

            // Add image files
            if (marketData.images && Array.isArray(marketData.images)) {
                marketData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append("images", image);
                    }
                });
            }

            const data = await fetchAPI("/api/markets/", {
                method: "POST",
                body: formData,
                isMultipart: true,
            });

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update existing market
    const updateMarket = async (id, marketData) => {
        try {
            setLoading(true);
            setError(null);

            // Create FormData for multipart form submission
            const formData = new FormData();

            // Add market data fields
            Object.keys(marketData).forEach((key) => {
                if (
                    key !== "images" &&
                    key !== "deleteImages" &&
                    marketData[key] !== null &&
                    marketData[key] !== undefined
                ) {
                    formData.append(key, marketData[key]);
                }
            });

            // Add image deletion IDs
            if (
                marketData.deleteImages &&
                Array.isArray(marketData.deleteImages) &&
                marketData.deleteImages.length > 0
            ) {
                formData.append(
                    "delete_images",
                    JSON.stringify(marketData.deleteImages)
                );
            }

            // Add new image files
            if (marketData.images && Array.isArray(marketData.images)) {
                marketData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append("images", image);
                    }
                });
            }

            const data = await fetchAPI(`/api/markets/${id}`, {
                method: "PUT",
                body: formData,
                isMultipart: true,
            });

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete market
    const deleteMarket = async (id) => {
        try {
            setLoading(true);
            setError(null);

            await fetchAPI(`/api/markets/${id}`, {
                method: "DELETE",
            });

            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        createMarket,
        updateMarket,
        deleteMarket,
        loading,
        error,
    };
};

// Hook untuk pencarian berdasarkan lokasi
export const useMarketsByLocation = (coordinates = {}) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { latitude, longitude, radius = 5 } = coordinates;

    const searchByLocation = async (lat, lng, searchRadius = radius) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                latitude: lat.toString(),
                longitude: lng.toString(),
                radius: searchRadius.toString(),
            }).toString();

            const data = await fetchAPI(
                `/api/markets/search/location?${queryParams}`
            );
            setMarkets(data.results || data.data || []);

            return data.results || data.data || [];
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (latitude && longitude) {
            const performSearch = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const queryParams = new URLSearchParams({
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                        radius: radius.toString(),
                    }).toString();

                    const data = await fetchAPI(
                        `/api/markets/search/location?${queryParams}`
                    );
                    setMarkets(data.results || data.data || []);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            performSearch();
        }
    }, [latitude, longitude, radius]);

    return {
        markets,
        loading,
        error,
        searchByLocation,
    };
};

// Hook untuk mencari pasar terdekat menggunakan Genetic Algorithm
export const useNearbyMarkets = () => {
    const [nearbyMarkets, setNearbyMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);

    const findNearbyMarkets = async (coordinates, options = {}) => {
        try {
            setLoading(true);
            setError(null);

            const { latitude, longitude } = coordinates;
            const { limit = 5, use_ga = true } = options;

            // Validate required fields
            if (!latitude || !longitude) {
                throw new Error("Latitude and longitude are required");
            }

            const requestBody = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                limit: parseInt(limit),
                use_ga: Boolean(use_ga),
            };

            const data = await fetchAPI("/api/markets/nearby", {
                method: "POST",
                body: JSON.stringify(requestBody),
            });

            if (data.success) {
                setNearbyMarkets(data.data || []);
                setMeta(data.meta || null);
                return {
                    markets: data.data || [],
                    meta: data.meta || null,
                    message: data.message,
                };
            } else {
                throw new Error(
                    data.error?.message || "Failed to find nearby markets"
                );
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setNearbyMarkets([]);
        setMeta(null);
        setError(null);
    };

    return {
        nearbyMarkets,
        loading,
        error,
        meta,
        findNearbyMarkets,
        clearResults,
    };
};

// Hook gabungan untuk semua operasi market
export const useMarketOperations = () => {
    const mutations = useMarketMutations();
    const nearbyMarkets = useNearbyMarkets();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return {
        ...mutations,
        ...nearbyMarkets,
        triggerRefresh,
        refreshTrigger,
    };
};

// Export utility function untuk build query params
export const buildMarketQuery = (params = {}) => {
    const { page, per_page, search, category } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page.toString());
    if (per_page) queryParams.append("per_page", per_page.toString());
    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);

    return queryParams.toString();
};

// Utility function untuk nearby markets request
export const buildNearbyMarketsRequest = (coordinates, options = {}) => {
    const { latitude, longitude } = coordinates;
    const { limit = 5, use_ga = true } = options;

    // Validate required fields
    if (!latitude || !longitude) {
        throw new Error("Latitude and longitude are required");
    }

    return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        limit: parseInt(limit),
        use_ga: Boolean(use_ga),
    };
};
