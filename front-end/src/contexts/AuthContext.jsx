import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { ApiService } from "../services/api";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    // Validate token with backend
    const validateToken = async () => {
        try {
            const response = await ApiService.verifyToken();
            return response.data.user;
        } catch (error) {
            console.error("Token validation failed:", error);
            return null;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }, []);

    // Manual token validation that can be called from anywhere
    const validateCurrentToken = useCallback(async () => {
        if (!token || isValidating) return false;

        setIsValidating(true);
        try {
            console.log("Manually validating current token...");
            const validatedUser = await validateToken();

            if (validatedUser) {
                setUser(validatedUser);
                localStorage.setItem("user", JSON.stringify(validatedUser));
                console.log("Manual validation successful");
                return true;
            } else {
                console.log("Manual validation failed, logging out");
                logout();
                return false;
            }
        } catch (error) {
            console.error("Manual validation error:", error);
            logout();
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [token, isValidating, logout]);

    useEffect(() => {
        // Check for stored auth data on mount and validate token
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser) {
                // Set token first so validateToken can use it
                setToken(storedToken);

                // Validate token with backend
                console.log("Validating stored token...");
                const validatedUser = await validateToken();

                if (validatedUser) {
                    // Token is valid, use validated user data
                    setUser(validatedUser);
                    // Update stored user data with fresh data from backend
                    localStorage.setItem("user", JSON.stringify(validatedUser));
                    console.log("Token is valid, user authenticated");
                } else {
                    // Token is invalid, clear stored data
                    console.log("Token is invalid, clearing auth data");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        // Listen for auth logout events from API interceptor
        const handleLogout = () => {
            console.log("Auto logout triggered from API interceptor");
            setUser(null);
            setToken(null);
        };

        window.addEventListener("auth:logout", handleLogout);

        return () => {
            window.removeEventListener("auth:logout", handleLogout);
        };
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const isAdmin = () => {
        return isAuthenticated() && user?.is_admin === true;
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading,
        validateCurrentToken,
        isValidating,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
