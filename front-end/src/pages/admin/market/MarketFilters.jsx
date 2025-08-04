import React from "react";
import { Search } from "lucide-react";

const MarketFilters = ({ search, setSearch, category, setCategory }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Cari pasar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="">Semua Kategori</option>
                    <option value="tradisional">Tradisional</option>
                    <option value="modern">Modern</option>
                    <option value="sayur">Sayur</option>
                    <option value="buah">Buah</option>
                </select>
            </div>
        </div>
    );
};

export default MarketFilters;
