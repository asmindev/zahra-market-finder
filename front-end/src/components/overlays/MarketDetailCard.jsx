import { MapPin, Navigation, X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";

const MarketDetailCard = ({
    showMarketCard,
    selectedMarket,
    onClose,
    onNavigateToDetail,
    onNavigateToLocation,
    onNavigateToOSM,
    isLoadingRoute,
}) => {
    console.log("MarketDetailCard rendered with:", {
        showMarketCard,
        selectedMarket: selectedMarket?.name,
        hasOnClose: !!onClose,
    });

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
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Market Info */}
                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {selectedMarket.name}
                                        </h3>
                                        <p className="text-gray-600 flex items-center space-x-2">
                                            <MapPin className="h-5 w-5 text-emerald-600" />
                                            <span>
                                                {selectedMarket.location}
                                            </span>
                                        </p>
                                    </div>

                                    {selectedMarket.category && (
                                        <div>
                                            <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                {selectedMarket.category}
                                            </span>
                                        </div>
                                    )}

                                    {selectedMarket.description && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">
                                                Deskripsi
                                            </h4>
                                            <p className="text-gray-600 leading-relaxed">
                                                {selectedMarket.description}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">
                                            Koordinat
                                        </h4>
                                        <p className="text-gray-600 font-mono bg-gray-50 p-3 rounded-lg">
                                            {selectedMarket.latitude},{" "}
                                            {selectedMarket.longitude}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-6 h-fit">
                                    <button
                                        onClick={() =>
                                            onNavigateToDetail(
                                                selectedMarket.id
                                            )
                                        }
                                        className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        Lihat Detail Lengkap
                                    </button>
                                    {/* <button
                                        onClick={() =>
                                            onNavigateToLocation(selectedMarket)
                                        }
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Navigation className="h-4 w-4" />
                                        <span>Navigasi ke Lokasi</span>
                                    </button> */}
                                    <button
                                        onClick={() =>
                                            onNavigateToOSM &&
                                            onNavigateToOSM(selectedMarket)
                                        }
                                        disabled={isLoadingRoute}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingRoute ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Mencari Rute...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="h-4 w-4" />
                                                <span>
                                                    Navigasi ke Lokasi (OSM)
                                                </span>
                                            </>
                                        )}
                                    </button>
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
                        <div className="p-6 pb-8">
                            {/* Handle Bar */}
                            <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

                            {/* Close Button */}
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Detail Pasar
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Market Info - Mobile optimized */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {selectedMarket.name}
                                    </h3>
                                    <p className="text-gray-600 flex items-center space-x-2">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                        <span>{selectedMarket.location}</span>
                                    </p>
                                </div>

                                {selectedMarket.category && (
                                    <div>
                                        <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                            {selectedMarket.category}
                                        </span>
                                    </div>
                                )}

                                {selectedMarket.description && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">
                                            Deskripsi
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {selectedMarket.description}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons - Mobile friendly */}
                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <button
                                        onClick={() =>
                                            onNavigateToDetail(
                                                selectedMarket.id
                                            )
                                        }
                                        className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-base"
                                    >
                                        Lihat Detail Lengkap
                                    </button>
                                    <button
                                        onClick={() =>
                                            onNavigateToLocation(selectedMarket)
                                        }
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3 text-base"
                                    >
                                        <Navigation className="h-5 w-5" />
                                        <span>Navigasi ke Lokasi</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            onNavigateToOSM &&
                                            onNavigateToOSM(selectedMarket)
                                        }
                                        disabled={isLoadingRoute}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingRoute ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Mencari Rute...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="h-5 w-5" />
                                                <span>
                                                    Navigasi ke Lokasi (OSM)
                                                </span>
                                            </>
                                        )}
                                    </button>
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
