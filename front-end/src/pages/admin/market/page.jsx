import React, { useState, Suspense, lazy } from "react";
import { useMarkets, useMarketMutations } from "@/hooks/use-market";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/layouts/loading";

// Lazy loading components
const MarketFilters = lazy(() => import("./MarketFilters"));
const MarketTable = lazy(() => import("./MarketTable"));
const MarketModal = lazy(() => import("./MarketModal"));
const MarketPagination = lazy(() => import("./MarketPagination"));

export default function MarketAdmin() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view", "delete"
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        latitude: "",
        longitude: "",
        category: "",
    });

    // Hooks
    const { markets, loading, error, pagination, refetch } = useMarkets({
        page,
        per_page: 10,
        search,
        category,
    });

    const {
        createMarket,
        updateMarket,
        deleteMarket,
        loading: mutationLoading,
    } = useMarketMutations();

    // Modal handlers
    const openCreateModal = () => {
        setModalMode("create");
        setFormData({
            name: "",
            location: "",
            description: "",
            latitude: "",
            longitude: "",
            category: "",
        });
        setIsOpen(true);
    };

    const openEditModal = (market) => {
        setModalMode("edit");
        setSelectedMarket(market);
        setFormData({
            name: market.name || "",
            location: market.location || "",
            description: market.description || "",
            latitude: market.latitude || "",
            longitude: market.longitude || "",
            category: market.category || "",
        });
        setIsOpen(true);
    };

    const openViewModal = (market) => {
        setModalMode("view");
        setSelectedMarket(market);
        setIsOpen(true);
    };

    const openDeleteModal = (market) => {
        setModalMode("delete");
        setSelectedMarket(market);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedMarket(null);
        setModalMode("create");
    };

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLocationChange = (latitude, longitude) => {
        setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (modalMode === "create") {
                await createMarket(formData);
            } else if (modalMode === "edit") {
                await updateMarket(selectedMarket.id, formData);
            }

            refetch();
            closeModal();
        } catch (error) {
            console.error("Error saving market:", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedMarket) return;

        try {
            await deleteMarket(selectedMarket.id);
            refetch();
            closeModal();
        } catch (error) {
            console.error("Error deleting market:", error);
            toast.error("Gagal menghapus pasar. Coba lagi.");
        }
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="w-full border rounded-xl p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Manajemen Pasar
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Kelola data pasar tradisional
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Pasar</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Suspense fallback={<Loading />}>
                <MarketFilters
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                />
            </Suspense>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Suspense fallback={<Loading />}>
                    <MarketTable
                        markets={markets}
                        loading={loading}
                        error={error}
                        onViewMarket={openViewModal}
                        onEditMarket={openEditModal}
                        onDeleteMarket={openDeleteModal}
                    />
                </Suspense>

                {/* Pagination */}
                <Suspense fallback={<Loading />}>
                    <MarketPagination
                        pagination={pagination}
                        handlePageChange={handlePageChange}
                    />
                </Suspense>
            </div>

            {/* Modal */}
            <Suspense fallback={<Loading />}>
                <MarketModal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    modalMode={modalMode}
                    selectedMarket={selectedMarket}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onLocationChange={handleLocationChange}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    mutationLoading={mutationLoading}
                />
            </Suspense>
        </div>
    );
}
