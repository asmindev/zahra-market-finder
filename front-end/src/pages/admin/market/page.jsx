import React, { useState, Suspense, lazy, useEffect } from "react";
import { useMarkets, useMarketMutations } from "@/hooks/use-market";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/layouts/loading";

// Lazy loading components
const MarketFilters = lazy(() => import("./MarketFilters"));
const MarketTable = lazy(() => import("./MarketTable"));
const MarketModal = lazy(() => import("./MarketModal"));
const MarketPagination = lazy(() => import("./MarketPagination"));

export default function MarketAdmin() {
    const { isAuthenticated, isAdmin, token } = useAuth();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
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
        images: [],
        deleteImages: [], // For tracking images to delete during edit
    });

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(search, 500);

    // Hooks
    const { markets, loading, error, pagination, refetch } = useMarkets({
        page,
        per_page: perPage,
        search: debouncedSearch,
        category,
    });

    const {
        createMarket,
        updateMarket,
        deleteMarket,
        loading: mutationLoading,
    } = useMarketMutations();

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, perPage]);

    // Modal handlers
    const openCreateModal = () => {
        if (!isAuthenticated() || !isAdmin()) {
            toast.error("Anda harus login sebagai admin untuk menambah pasar.");
            return;
        }

        setModalMode("create");
        setFormData({
            name: "",
            location: "",
            description: "",
            latitude: "",
            longitude: "",
            category: "",
            images: [],
            deleteImages: [],
        });
        setIsOpen(true);
    };

    const openEditModal = (market) => {
        if (!isAuthenticated() || !isAdmin()) {
            toast.error("Anda harus login sebagai admin untuk mengedit pasar.");
            return;
        }

        setModalMode("edit");
        setSelectedMarket(market);
        setFormData({
            name: market.name || "",
            location: market.location || "",
            description: market.description || "",
            latitude: market.latitude || "",
            longitude: market.longitude || "",
            category: market.category || "",
            images: market.images || [],
            deleteImages: [],
        });
        setIsOpen(true);
    };

    const openViewModal = (market) => {
        setModalMode("view");
        setSelectedMarket(market);
        setIsOpen(true);
    };

    const openDeleteModal = (market) => {
        if (!isAuthenticated() || !isAdmin()) {
            toast.error(
                "Anda harus login sebagai admin untuk menghapus pasar."
            );
            return;
        }

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

    const handleImagesChange = (images) => {
        setFormData((prev) => {
            // Separate existing images from new files
            const existingImages = [];
            const newFiles = [];
            const imagesToDelete = [];

            images.forEach((image) => {
                if (image instanceof File) {
                    newFiles.push(image);
                } else if (image.id) {
                    existingImages.push(image);
                }
            });

            // Find images that were deleted (existed before but not now)
            const currentImageIds = existingImages.map((img) => img.id);
            const previousImageIds = (prev.images || [])
                .filter((img) => img.id)
                .map((img) => img.id);

            const deletedIds = previousImageIds.filter(
                (id) => !currentImageIds.includes(id)
            );

            return {
                ...prev,
                images: [...existingImages, ...newFiles],
                deleteImages: [...prev.deleteImages, ...deletedIds].filter(
                    (id, index, arr) => arr.indexOf(id) === index
                ), // Remove duplicates
            };
        });
    };

    const handleSubmit = async () => {
        if (!isAuthenticated() || !isAdmin()) {
            toast.error(
                "Anda harus login sebagai admin untuk menyimpan data pasar."
            );
            closeModal();
            return;
        }

        try {
            if (modalMode === "create") {
                await createMarket(formData);
                toast.success("Pasar berhasil ditambahkan!");
            } else if (modalMode === "edit") {
                await updateMarket(selectedMarket.id, formData);
                toast.success("Pasar berhasil diupdate!");
            }

            refetch();
            closeModal();
        } catch (error) {
            console.error("Error saving market:", error);
            if (error.message.includes("Sesi telah berakhir")) {
                toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else {
                toast.error("Gagal menyimpan data pasar. Coba lagi.");
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedMarket) return;

        if (!isAuthenticated() || !isAdmin()) {
            toast.error(
                "Anda harus login sebagai admin untuk menghapus pasar."
            );
            closeModal();
            return;
        }

        try {
            await deleteMarket(selectedMarket.id);
            toast.success("Pasar berhasil dihapus!");
            refetch();
            closeModal();
        } catch (error) {
            console.error("Error deleting market:", error);
            if (error.message.includes("Sesi telah berakhir")) {
                toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            } else {
                toast.error("Gagal menghapus pasar. Coba lagi.");
            }
        }
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.total_pages || 1)) {
            setPage(newPage);
        }
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setPage(1); // Reset to first page when changing per page
    };

    return (
        <div className="w-full border rounded-xl p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Admin access warning */}
            {(!isAuthenticated() || !isAdmin()) && (
                <Alert className="mb-6 border-amber-200 bg-amber-50">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        <strong>Peringatan:</strong> Beberapa fitur (tambah,
                        edit, hapus pasar) memerlukan login sebagai admin.
                        {!isAuthenticated() &&
                            " Silakan login terlebih dahulu."}
                        {isAuthenticated() &&
                            !isAdmin() &&
                            " Akun Anda tidak memiliki akses admin."}
                    </AlertDescription>
                </Alert>
            )}

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
                    <Button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2"
                        disabled={!isAuthenticated() || !isAdmin()}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Pasar</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Suspense fallback={<Loading />}>
                <MarketFilters
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    perPage={perPage}
                    setPerPage={handlePerPageChange}
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
                        isAdmin={isAuthenticated() && isAdmin()}
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
                    onImagesChange={handleImagesChange}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    mutationLoading={mutationLoading}
                />
            </Suspense>
        </div>
    );
}
