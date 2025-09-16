import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const useAuthValidation = () => {
    const { logout, isAuthenticated, isAdmin, validateCurrentToken } =
        useAuth();
    const navigate = useNavigate();

    // Check if user is authenticated and validate token
    const checkAuth = useCallback(async () => {
        if (!isAuthenticated()) {
            return false;
        }

        // Validate current token
        const isValid = await validateCurrentToken();
        if (!isValid) {
            navigate("/auth/signin");
            return false;
        }

        return true;
    }, [isAuthenticated, validateCurrentToken, navigate]);

    // Protect route - redirect to login if not authenticated
    const requireAuth = useCallback(async () => {
        const isValid = await checkAuth();
        if (!isValid) {
            navigate("/auth/signin");
            return false;
        }
        return true;
    }, [checkAuth, navigate]);

    // Protect admin route - redirect to login if not admin
    const requireAdmin = useCallback(async () => {
        const isValid = await checkAuth();
        if (!isValid) {
            navigate("/auth/signin");
            return false;
        }

        if (!isAdmin()) {
            navigate("/auth/signin");
            return false;
        }

        return true;
    }, [checkAuth, isAdmin, navigate]);

    // Logout and redirect
    const logoutAndRedirect = useCallback(() => {
        logout();
        navigate("/auth/signin");
    }, [logout, navigate]);

    return {
        checkAuth,
        requireAuth,
        requireAdmin,
        logoutAndRedirect,
        validateCurrentToken,
    };
};
