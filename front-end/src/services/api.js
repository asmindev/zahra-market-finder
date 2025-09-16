// API base URL
const API_BASE_URL = "http://localhost:5000/api";

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem("token");
};

// Create headers with auth token
const createAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

// Handle API response
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        // If unauthorized, token might be invalid
        if (response.status === 401) {
            // Clear invalid token from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Dispatch a custom event to notify AuthContext
            window.dispatchEvent(new CustomEvent("auth:logout"));
        }

        throw new Error(data.error?.message || "API request failed");
    }

    return data;
};

// API service class
export class ApiService {
    // Auth endpoints
    static async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        return handleResponse(response);
    }

    static async verifyToken() {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: createAuthHeaders(),
        });

        return handleResponse(response);
    }

    static async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: createAuthHeaders(),
        });

        return handleResponse(response);
    }

    static async updateProfile(profileData) {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: createAuthHeaders(),
            body: JSON.stringify(profileData),
        });

        return handleResponse(response);
    }

    // Market endpoints
    static async getMarkets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
            ? `${API_BASE_URL}/markets/?${queryString}`
            : `${API_BASE_URL}/markets/`;

        const response = await fetch(url);
        return handleResponse(response);
    }

    static async getMarket(id) {
        const response = await fetch(`${API_BASE_URL}/markets/${id}`);
        return handleResponse(response);
    }

    static async createMarket(marketData) {
        const response = await fetch(`${API_BASE_URL}/markets/`, {
            method: "POST",
            headers: createAuthHeaders(),
            body: JSON.stringify(marketData),
        });

        return handleResponse(response);
    }

    static async updateMarket(id, marketData) {
        const response = await fetch(`${API_BASE_URL}/markets/${id}`, {
            method: "PUT",
            headers: createAuthHeaders(),
            body: JSON.stringify(marketData),
        });

        return handleResponse(response);
    }

    static async deleteMarket(id) {
        const response = await fetch(`${API_BASE_URL}/markets/${id}`, {
            method: "DELETE",
            headers: createAuthHeaders(),
        });

        return handleResponse(response);
    }

    static async searchMarkets(query, params = {}) {
        const searchParams = { q: query, ...params };
        const queryString = new URLSearchParams(searchParams).toString();

        const response = await fetch(
            `${API_BASE_URL}/markets/search?${queryString}`
        );
        return handleResponse(response);
    }

    static async searchMarketsByLocation(latitude, longitude, radius = 10) {
        const params = new URLSearchParams({
            latitude,
            longitude,
            radius,
        }).toString();

        const response = await fetch(
            `${API_BASE_URL}/markets/search/location?${params}`
        );
        return handleResponse(response);
    }

    static async findNearbyMarkets(location) {
        const response = await fetch(`${API_BASE_URL}/markets/nearby`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(location),
        });

        return handleResponse(response);
    }
}
