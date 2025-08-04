import { useMarket } from "@/hooks/use-market";
import Loading from "@/layouts/loading";
import MarketMap from "@/components/MarketMap";
import React from "react";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft,
    MapPin,
    RefreshCw,
    Clock,
    Star,
    Navigation,
} from "lucide-react";

export default function DetailMarket() {
    const params = useParams();
    const navigate = useNavigate();
    const { market, loading, error, refetch } = useMarket(params.id);

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/market")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Kembali ke Daftar Pasar
                    </button>
                </div>
            </div>
        );
    }

    if (!market) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-4">🏪</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Pasar Tidak Ditemukan
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Pasar yang Anda cari tidak tersedia
                    </p>
                    <button
                        onClick={() => navigate("/market")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Kembali ke Daftar Pasar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
            {/* Mobile-First Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Mobile Back Button */}
                        <button
                            onClick={() => navigate("/market")}
                            className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium hidden sm:inline">
                                Kembali ke Daftar Pasar
                            </span>
                            <span className="text-sm font-medium sm:hidden">
                                Kembali
                            </span>
                        </button>

                        {/* Mobile Refresh Button */}
                        <button
                            onClick={refetch}
                            className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-105 group"
                        >
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                            <span className="text-sm font-medium hidden sm:inline">
                                Refresh
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile-First Content */}
            <div className="px-3 py-4 sm:px-4 sm:py-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
                    {/* Mobile-Optimized Hero Section */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-8 sm:px-8 sm:py-12">
                        <div className="text-center">
                            <div className="text-white/80 text-3xl sm:text-4xl mb-3 sm:mb-4">
                                🏪
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                                {market.data.name}
                            </h1>
                            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-white flex-shrink-0" />
                                <span className="text-white text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-none">
                                    {market.data.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile-First Details Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:p-6 lg:p-8">
                        {/* Mobile: Single Column Layout */}
                        <div className="space-y-6">
                            {/* Description - Mobile First */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <span className="text-emerald-600 text-lg sm:text-xl">
                                        📝
                                    </span>
                                    <span>Deskripsi Pasar</span>
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 sm:p-4">
                                    {market.data.description ||
                                        "Deskripsi pasar tidak tersedia."}
                                </p>
                            </div>

                            {/* Location Details - Mobile Optimized */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                                    <span>Informasi Lokasi</span>
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-xs sm:text-sm text-gray-600 block">
                                            Alamat:
                                        </span>
                                        <span className="text-sm sm:text-base text-gray-800 font-medium block">
                                            {market.data.location}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs sm:text-sm text-gray-600 block">
                                            Koordinat:
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-800 font-mono block break-all">
                                            {market.data.latitude},{" "}
                                            {market.data.longitude}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating - Mobile Optimized */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                                    <span>Rating & Ulasan</span>
                                </h3>
                                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center space-x-0.5 sm:space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                        4.5 (128 ulasan)
                                    </span>
                                </div>
                            </div>

                            {/* Operating Hours - Mobile Optimized */}
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                                    <span>Jam Operasional</span>
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">
                                            Senin - Jumat:
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-800 font-medium">
                                            06:00 - 18:00
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-600">
                                            Sabtu - Minggu:
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-800 font-medium">
                                            05:00 - 19:00
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Interactive Map */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                                <span>Lokasi di Peta</span>
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <MarketMap
                                    market={market.data}
                                    className="h-48 sm:h-64 rounded-lg overflow-hidden border border-gray-200"
                                />
                                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => {
                                            const url = `https://www.google.com/maps?q=${market.data.latitude},${market.data.longitude}`;
                                            window.open(url, "_blank");
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span>Buka di Google Maps</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const coords = `${market.data.latitude},${market.data.longitude}`;
                                            navigator.clipboard.writeText(
                                                coords
                                            );
                                            // Bisa tambahkan toast notification di sini
                                            alert(
                                                "Koordinat berhasil disalin!"
                                            );
                                        }}
                                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Salin Koordinat
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile-First Action Buttons */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <button
                                    onClick={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${market.data.latitude},${market.data.longitude}`;
                                        window.open(url, "_blank");
                                    }}
                                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-emerald-700 transition-colors active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <Navigation className="h-4 w-4" />
                                    <span>Petunjuk Arah</span>
                                </button>
                                <button className="w-full border-2 border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-emerald-50 transition-colors active:scale-95">
                                    Bagikan Pasar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
