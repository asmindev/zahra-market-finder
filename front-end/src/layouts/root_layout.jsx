import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
    Search,
    MapPin,
    Menu,
    X,
    Store,
    Bell,
    User,
    Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AnimatedOutlet from "./animated_outlet";
import { Suspense } from "react";
import Loading from "./loading";
import { useSearch } from "../hooks/use-search";

export default function RootLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
        { to: "/", label: "Beranda" },
        { to: "/market", label: "Pasar" },
        { to: "/about", label: "Tentang" },
        { to: "/contact", label: "Kontak" },
    ];

    // Search functionality
    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            // Navigate to market page with search params
            navigate(`/market?search=${encodeURIComponent(searchTerm.trim())}`);
        } else if (location.pathname === "/market") {
            // Clear search params if on market page
            navigate("/market");
        }
    };

    const { searchTerm, setSearchTerm, isSearching, clearSearch } = useSearch(
        handleSearch,
        500
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modern Navbar */}

            {/* Main Content */}
            <main>
                <Suspense fallback={<Loading />}>
                    <AnimatedOutlet />
                </Suspense>
            </main>
        </div>
    );
}
