import React from "react";
import { Edit, Trash2, MapPin, Eye } from "lucide-react";
import Loading from "@/layouts/loading";

const MarketTable = ({
    markets,
    loading,
    error,
    onViewMarket,
    onEditMarket,
    onDeleteMarket,
}) => {
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama Pasar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lokasi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Koordinat
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {markets?.map((market) => (
                            <tr key={market.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {market.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 flex items-center">
                                        <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                        {market.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                        {market.category || "Umum"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-gray-500 font-mono">
                                        {market.latitude}, {market.longitude}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onViewMarket(market)}
                                            className="text-gray-600 hover:text-gray-900 p-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onEditMarket(market)}
                                            className="text-emerald-600 hover:text-emerald-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                onDeleteMarket(market)
                                            }
                                            className="text-red-600 hover:text-red-900 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
                {markets?.map((market) => (
                    <div
                        key={market.id}
                        className="p-4 border-b border-gray-200"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                    {market.name}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                    {market.location}
                                </p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 mt-2">
                                    {market.category || "Umum"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <button
                                    onClick={() => onViewMarket(market)}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onEditMarket(market)}
                                    className="text-emerald-600 hover:text-emerald-900 p-1"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDeleteMarket(market)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default MarketTable;
