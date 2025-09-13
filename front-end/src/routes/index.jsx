import { BrowserRouter, Routes, Route } from "react-router";
import { lazy } from "react";

import AdminLayout from "@/layouts/admin_layout.jsx";
import Dashboard from "@/pages/admin/dashboard/page.jsx";
import RootLayout from "@/layouts/root_layout.jsx";
import Home from "@/pages/home/page.jsx";
// import Market from "@/pages/market/page.jsx";
import MarketAdmin from "@/pages/admin/market/page.jsx";
import NotFound from "@/pages/errors/404";
import DetailMarket from "@/pages/market/detail-market";
import SignIn from "@/pages/auth/signin/page.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";

const Market = lazy(() => import("@/pages/market/page.jsx"));

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="market" element={<Market />} />
                <Route path="market/:id" element={<DetailMarket />} />
            </Route>

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="market" element={<MarketAdmin />} />
                {/* Add more admin routes here */}
            </Route>

            {/* Auth Routes */}
            <Route path="/auth/signin" element={<SignIn />} />

            {/* error page */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
