import { Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/auth/signin" replace />;
    }

    return children;
};
