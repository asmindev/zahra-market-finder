import React, { useState, useEffect } from "react";
import { Save, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import LocationPicker from "@/components/LocationPicker";

const MarketModal = ({
    isOpen,
    setIsOpen,
    modalMode,
    selectedMarket,
    formData,
    onInputChange,
    onLocationChange,
    onSubmit,
    onDelete,
    mutationLoading,
}) => {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [autoLocation, setAutoLocation] = useState("");

    // Function to get location name from coordinates
    const fetchLocationName = async (latitude, longitude) => {
        if (!latitude || !longitude) return;

        setIsLoadingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            if (data && data.display_name) {
                const suggestedLocation = data.display_name;
                setAutoLocation(suggestedLocation);
            }
        } catch (error) {
            console.error("Error fetching location name:", error);
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Custom location change handler
    const handleLocationChange = (latitude, longitude) => {
        onLocationChange(latitude, longitude);
        fetchLocationName(latitude, longitude);
    };

    // Function to use suggested location
    const useSuggestedLocation = () => {
        if (autoLocation) {
            onInputChange({
                target: {
                    name: "location",
                    value: autoLocation,
                },
            });
        }
    };

    // Reset auto location when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAutoLocation("");
            setIsLoadingLocation(false);
        }
    }, [isOpen]);

    // Fetch location name when coordinates are available (for edit mode)
    useEffect(() => {
        if (modalMode === "edit" && formData.latitude && formData.longitude) {
            fetchLocationName(formData.latitude, formData.longitude);
        }
    }, [modalMode, formData.latitude, formData.longitude]);
    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
            className="border border-red-500"
        >
            <DialogContent
                className={`${
                    modalMode === "delete"
                        ? "sm:max-w-md"
                        : "sm:max-w-6xl max-h-[90vh] overflow-y-auto"
                }`}
            >
                <DialogHeader>
                    <DialogTitle>
                        {modalMode === "create" && "Tambah Pasar Baru"}
                        {modalMode === "edit" && "Edit Pasar"}
                        {modalMode === "view" && "Detail Pasar"}
                        {modalMode === "delete" && "Hapus Pasar"}
                    </DialogTitle>
                    {modalMode === "delete" && (
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus pasar "
                            {selectedMarket?.name}"? Tindakan ini tidak dapat
                            dibatalkan.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Modal Content */}
                <div className="py-4">
                    {modalMode === "delete" ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    ) : modalMode === "view" ? (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Info fields - Left side on desktop */}
                            <div className="space-y-4 w-full md:w-1/2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pasar
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedMarket?.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lokasi
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedMarket?.location}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedMarket?.description ||
                                            "Tidak ada deskripsi"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Latitude
                                        </label>
                                        <p className="text-gray-900 font-mono text-sm">
                                            {selectedMarket?.latitude}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Longitude
                                        </label>
                                        <p className="text-gray-900 font-mono text-sm">
                                            {selectedMarket?.longitude}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                        {selectedMarket?.category || "Umum"}
                                    </span>
                                </div>
                            </div>

                            {/* Preview peta - Right side on desktop, bottom on mobile */}
                            <div className="w-full md:w-1/2">
                                {selectedMarket?.latitude &&
                                selectedMarket?.longitude ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lokasi di Peta
                                        </label>
                                        <LocationPicker
                                            latitude={selectedMarket.latitude}
                                            longitude={selectedMarket.longitude}
                                            onLocationChange={() => {}} // Read-only untuk view
                                            className="w-full h-80 md:h-96 border border-gray-300 rounded-lg pointer-events-none opacity-90"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-80 md:h-96 bg-gray-100 border border-gray-300 rounded-lg">
                                        <p className="text-gray-500">
                                            Koordinat tidak tersedia
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Form fields - Left side on desktop */}
                            <div className="space-y-4 w-full md:w-1/2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pasar *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={onInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Masukkan nama pasar"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lokasi *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={onInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Masukkan lokasi pasar"
                                    />

                                    {/* Auto-detected location suggestion */}
                                    {autoLocation &&
                                        autoLocation !== formData.location && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 text-green-600 mr-1" />
                                                        <span className="text-sm text-green-700">
                                                            Lokasi terdeteksi:{" "}
                                                            <strong>
                                                                {autoLocation}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            useSuggestedLocation
                                                        }
                                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Gunakan
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    {isLoadingLocation && (
                                        <div className="mt-2 flex items-center text-sm text-gray-600">
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            Mencari nama lokasi...
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={onInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Masukkan deskripsi pasar"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Latitude *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={onInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                                            placeholder="-6.2088"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Longitude *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={onInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                                            placeholder="106.8456"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={onInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Pilih kategori</option>
                                        <option value="tradisional">
                                            Tradisional
                                        </option>
                                        <option value="modern">Modern</option>
                                        <option value="sayur">Sayur</option>
                                        <option value="buah">Buah</option>
                                    </select>
                                </div>

                                {/* Instruksi untuk klik peta */}
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        💡 <strong>Tip:</strong> Klik pada peta
                                        untuk memilih lokasi pasar. Koordinat
                                        latitude dan longitude akan terisi
                                        otomatis, dan nama lokasi akan dideteksi
                                        secara otomatis dari koordinat tersebut.
                                    </p>
                                </div>
                            </div>

                            {/* Location Picker - Right side on desktop, bottom on mobile */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Lokasi di Peta *
                                </label>
                                <LocationPicker
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    onLocationChange={handleLocationChange}
                                    className="w-full h-96 rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {modalMode === "delete" ? (
                        <div className="flex space-x-3 w-full">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={mutationLoading}
                                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {mutationLoading ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    ) : modalMode === "view" ? (
                        <button
                            onClick={closeModal}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Tutup
                        </button>
                    ) : (
                        <div className="flex space-x-3 w-full">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={mutationLoading}
                                className="flex-1 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>
                                    {mutationLoading
                                        ? "Menyimpan..."
                                        : "Simpan"}
                                </span>
                            </button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MarketModal;
