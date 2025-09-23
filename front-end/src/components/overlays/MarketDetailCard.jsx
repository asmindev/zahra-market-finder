import {
    MapPin,
    Navigation,
    X,
    Camera,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";

const MarketDetailCard = ({
    showMarketCard,
    selectedMarket,
    onClose,
    onNavigateToDetail,
    onNavigateToLocation,
    onNavigateToOSM,
    isLoadingRoute,
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    console.log("MarketDetailCard rendered with:", {
        showMarketCard,
        selectedMarket: selectedMarket?.name,
        hasOnClose: !!onClose,
    });

    const nextImage = () => {
        if (selectedMarket?.images?.length > 0) {
            setSelectedImageIndex((prev) =>
                prev === selectedMarket.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedMarket?.images?.length > 0) {
            setSelectedImageIndex((prev) =>
                prev === 0 ? selectedMarket.images.length - 1 : prev - 1
            );
        }
    };

    const getImageUrl = (image) => {
        return `${
            import.meta.env.VITE_BASE_API_URL || "http://localhost:8000"
        }/api/markets/images/${image.filename}`;
    };

    return (
        <>
            {/* Desktop Market Detail Card */}
            <AnimatePresence>
                {showMarketCard && selectedMarket && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3,
                        }}
                        className="hidden lg:block fixed right-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-sm shadow-2xl border-l border-gray-200 z-[1001] overflow-y-auto"
                    >
                        <div className="p-6 flex flex-col h-full">
                            {/* Close Button */}
                            <div className="h-fit flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Detail Pasar
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Market Info */}
                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {selectedMarket.name}
                                            </h3>
                                            {selectedMarket.category && (
                                                <Badge
                                                    variant="success"
                                                    className="px-3 py-1 text-sm"
                                                >
                                                    {selectedMarket.category}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-gray-600 flex items-center space-x-2">
                                            <MapPin className="size-10 text-emerald-600" />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                {selectedMarket.location}
                                            </span>
                                        </p>
                                        {/* description */}
                                        <p className="text-gray-600">
                                            {selectedMarket.description}
                                        </p>
                                    </div>

                                    {/* Images Carousel */}
                                    {selectedMarket.images &&
                                        selectedMarket.images.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                                    <Camera className="h-4 w-4 mr-2" />
                                                    Galeri Foto (
                                                    {
                                                        selectedMarket.images
                                                            .length
                                                    }
                                                    )
                                                </h4>

                                                {/* Main Image Carousel */}
                                                <div className="relative mb-4">
                                                    <div className="max-h-[400px] rounded-lg overflow-hidden bg-gray-100 border">
                                                        <img
                                                            src={getImageUrl(
                                                                selectedMarket
                                                                    .images[
                                                                    selectedImageIndex
                                                                ]
                                                            )}
                                                            alt={
                                                                selectedMarket
                                                                    .images[
                                                                    selectedImageIndex
                                                                ]
                                                                    ?.original_filename
                                                            }
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                                e.target.nextSibling.style.display =
                                                                    "flex";
                                                            }}
                                                        />
                                                        <div
                                                            className="w-full h-full flex items-center justify-center bg-gray-100"
                                                            style={{
                                                                display: "none",
                                                            }}
                                                        >
                                                            <Camera className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    </div>

                                                    {/* Navigation Arrows */}
                                                    {selectedMarket.images
                                                        .length > 1 && (
                                                        <>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={
                                                                    prevImage
                                                                }
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 border-none rounded-full p-2"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={
                                                                    nextImage
                                                                }
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 border-none rounded-full p-2"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* Image Counter */}
                                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                                        {selectedImageIndex + 1}{" "}
                                                        /{" "}
                                                        {
                                                            selectedMarket
                                                                .images.length
                                                        }
                                                    </div>
                                                </div>

                                                {/* Thumbnail Strip */}
                                                {selectedMarket.images.length >
                                                    1 && (
                                                    <div className="flex space-x-2 overflow-x-auto pb-2">
                                                        {selectedMarket.images.map(
                                                            (image, index) => (
                                                                <Button
                                                                    key={
                                                                        image.id ||
                                                                        index
                                                                    }
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setSelectedImageIndex(
                                                                            index
                                                                        )
                                                                    }
                                                                    className={`flex-shrink-0 w-16 h-16 p-0 rounded-lg overflow-hidden border-2 transition-all ${
                                                                        index ===
                                                                        selectedImageIndex
                                                                            ? "border-emerald-500 ring-2 ring-emerald-200"
                                                                            : "border-gray-200 hover:border-gray-300"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={getImageUrl(
                                                                            image
                                                                        )}
                                                                        alt={
                                                                            image.original_filename
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-6 h-fit">
                                    <Button
                                        onClick={() =>
                                            onNavigateToOSM &&
                                            onNavigateToOSM(selectedMarket)
                                        }
                                        disabled={isLoadingRoute}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoadingRoute ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span>Mencari Rute...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="h-4 w-4 mr-2" />
                                                <span>
                                                    Navigasi ke Lokasi (OSM)
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
                {showMarketCard && selectedMarket && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3,
                        }}
                        className="lg:hidden fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl z-[1000] max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 pb-4">
                            {/* Handle Bar */}
                            <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

                            {/* Close Button */}
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Detail Pasar
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* Market Info - Mobile optimized */}
                            <div className="space-y-6 max-h-[40vh] overflow-y-auto">
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {selectedMarket.name}
                                        </h3>
                                        {selectedMarket.category && (
                                            <Badge
                                                variant="success"
                                                className="px-3 py-1 text-sm"
                                            >
                                                {selectedMarket.category}
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-gray-600 flex items-center space-x-2">
                                        <MapPin className="size-10 text-emerald-600" />
                                        <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                            {selectedMarket.location}
                                        </span>
                                    </p>
                                    <p className="text-gray-600">
                                        {selectedMarket.description}
                                    </p>
                                </div>

                                {/* Images Carousel - Mobile */}
                                {selectedMarket.images &&
                                    selectedMarket.images.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                                <Camera className="h-4 w-4 mr-2" />
                                                Galeri Foto (
                                                {selectedMarket.images.length})
                                            </h4>

                                            {/* Main Image Carousel */}
                                            <div className="relative mb-4">
                                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                                                    <img
                                                        src={getImageUrl(
                                                            selectedMarket
                                                                .images[
                                                                selectedImageIndex
                                                            ]
                                                        )}
                                                        alt={
                                                            selectedMarket
                                                                .images[
                                                                selectedImageIndex
                                                            ]?.original_filename
                                                        }
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.nextSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />
                                                    <div
                                                        className="w-full h-full flex items-center justify-center bg-gray-100"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                    >
                                                        <Camera className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                </div>

                                                {/* Navigation Arrows */}
                                                {selectedMarket.images.length >
                                                    1 && (
                                                    <>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={prevImage}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 border-none rounded-full p-2"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={nextImage}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 border-none rounded-full p-2"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Image Counter */}
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                                    {selectedImageIndex + 1} /{" "}
                                                    {
                                                        selectedMarket.images
                                                            .length
                                                    }
                                                </div>
                                            </div>

                                            {/* Thumbnail Strip */}
                                            {selectedMarket.images.length >
                                                1 && (
                                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                                    {selectedMarket.images.map(
                                                        (image, index) => (
                                                            <Button
                                                                key={
                                                                    image.id ||
                                                                    index
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setSelectedImageIndex(
                                                                        index
                                                                    )
                                                                }
                                                                className={`flex-shrink-0 w-14 h-14 p-0 rounded-lg overflow-hidden border-2 transition-all ${
                                                                    index ===
                                                                    selectedImageIndex
                                                                        ? "border-emerald-500 ring-2 ring-emerald-200"
                                                                        : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            >
                                                                <img
                                                                    src={getImageUrl(
                                                                        image
                                                                    )}
                                                                    alt={
                                                                        image.original_filename
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {/* Action Buttons - Mobile friendly */}
                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <Button
                                        onClick={() =>
                                            onNavigateToOSM &&
                                            onNavigateToOSM(selectedMarket)
                                        }
                                        disabled={isLoadingRoute}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoadingRoute ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span>Mencari Rute...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="h-5 w-5 mr-2" />
                                                <span>
                                                    Navigasi ke Lokasi (OSM)
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MarketDetailCard;
