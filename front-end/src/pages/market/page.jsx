import { useMarkets } from "@/hooks/use-market";
import Loading from "@/layouts/loading";
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useSearchParams } from "react-router";

// Component untuk data kosong
const EmptyState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-600">Belum ada data pasar tersedia</p>
        </div>
    </div>
);

// Main component - menggunakan hooks useMarkets
export default function Market() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("");
    const searchInputRef = useRef(null);

    // Get search from URL params
    const urlSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState(urlSearch);

    // Update local search when URL params change
    useEffect(() => {
        setSearch(urlSearch);
    }, [urlSearch]);

    // Update URL when search changes locally
    const handleSearchChange = (newSearch) => {
        setSearch(newSearch);
        if (newSearch.trim()) {
            setSearchParams({ search: newSearch.trim() });
        } else {
            setSearchParams({});
        }
        setPage(1); // Reset to first page when searching
    };

    const { markets, loading, error, pagination, refetch } = useMarkets({
        page,
        per_page: 10,
        search,
        category,
    });

    if (error)
        return (
            <div className="text-red-600 text-center py-8">Error: {error}</div>
        );
    if (loading) return <Loading />;
    if (markets.length === 0) return <EmptyState />;

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header Section - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
                    Daftar Pasar Tradisional
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Temukan pasar tradisional terbaik di sekitar Anda
                </p>
            </div>

            {/* Search and Filter Section - Mobile First */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
                    {/* Search Input - Full width on mobile */}
                    <div className="w-full sm:flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cari Pasar
                        </label>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Masukkan nama pasar..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base sm:text-sm"
                        />
                    </div>

                    {/* Category Select - Full width on mobile, auto width on desktop */}
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base sm:text-sm"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="tradisional">Tradisional</option>
                            <option value="modern">Modern</option>
                            <option value="sayuran">Sayuran</option>
                            <option value="makanan">Makanan</option>
                        </select>
                    </div>

                    {/* Action Buttons - Stack on mobile, inline on desktop */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-end sm:w-auto">
                        <button
                            onClick={refetch}
                            className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-base sm:text-sm"
                        >
                            Refresh
                        </button>
                        {search && (
                            <button
                                onClick={() => handleSearchChange("")}
                                className="w-full sm:w-auto bg-gray-500 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium text-base sm:text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Info - Mobile Optimized */}
            <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-600 px-1">
                    <span className="font-medium">{markets.length}</span> dari{" "}
                    <span className="font-medium">{pagination.total || 0}</span>{" "}
                    pasar
                    {search && (
                        <span className="block sm:inline">
                            {" "}
                            untuk{" "}
                            <span className="font-medium">"{search}"</span>
                        </span>
                    )}
                    {category && (
                        <span className="block sm:inline">
                            {" "}
                            kategori{" "}
                            <span className="font-medium">"{category}"</span>
                        </span>
                    )}
                </p>
            </div>

            {/* Markets Grid - Mobile First Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {markets.map((market) => (
                    <div
                        key={market.id}
                        className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="text-2xl sm:text-3xl">🏪</div>
                            {market.rating && (
                                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                                    <span className="text-yellow-500 text-sm">
                                        ⭐
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-yellow-700">
                                        {market.rating}
                                    </span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                            {market.name || market.title}
                        </h3>

                        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                            📍 {market.location}
                        </p>

                        {market.description && (
                            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                                {market.description}
                            </p>
                        )}

                        {market.category && (
                            <div className="mb-3 sm:mb-4">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                    {market.category}
                                </span>
                            </div>
                        )}

                        <NavLink to={`/market/${market.id}`}>
                            <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 sm:py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 text-sm sm:text-base">
                                Lihat Detail
                            </button>
                        </NavLink>
                    </div>
                ))}
            </div>

            {/* Pagination - Mobile Optimized */}
            {pagination.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Mobile: Stack buttons vertically */}
                    <div className="flex items-center justify-center space-x-2 sm:hidden">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            ‹ Prev
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600">
                            {page} / {pagination.total_pages}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === pagination.total_pages}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Next ›
                        </button>
                    </div>

                    {/* Desktop: Full pagination */}
                    <div className="hidden sm:flex items-center space-x-4">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <div className="flex space-x-2">
                            {Array.from(
                                { length: pagination.total_pages },
                                (_, i) => i + 1
                            )
                                .filter(
                                    (pageNum) =>
                                        pageNum === 1 ||
                                        pageNum === pagination.total_pages ||
                                        Math.abs(pageNum - page) <= 2
                                )
                                .map((pageNum, index, arr) => (
                                    <React.Fragment key={pageNum}>
                                        {index > 0 &&
                                            arr[index - 1] !== pageNum - 1 && (
                                                <span className="px-2 py-2 text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                        <button
                                            onClick={() => setPage(pageNum)}
                                            className={`px-4 py-2 rounded-lg font-medium ${
                                                page === pageNum
                                                    ? "bg-emerald-600 text-white"
                                                    : "border border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    </React.Fragment>
                                ))}
                        </div>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === pagination.total_pages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
