import { Navigation, Target, Plus, Minus, MapPin } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

const ControlButtons = ({
    isGettingLocation,
    nearbyLoading,
    userLocation,
    onGetLocation,
    onFindNearby,
    onZoomIn,
    onZoomOut,
    onOpenLocationPicker,
    useManualLocation = false,
    isPickingLocation = false,
    manualLocation = null,
}) => {
    // Cek apakah ada lokasi yang tersedia (GPS atau manual)
    const hasLocation = userLocation || (useManualLocation && manualLocation);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-3 right-3 z-[1000] sm:bottom-4 sm:right-4"
        >
            {/* Location and Nearby Controls - Mobile priority */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-3 sm:rounded-lg sm:mb-4">
                {/* Get User Location Button */}
                <motion.button
                    onClick={onGetLocation}
                    whileHover={{
                        backgroundColor: "rgb(59 130 246 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-200 sm:w-10 sm:h-10 ${
                        isGettingLocation ? "animate-pulse" : ""
                    }`}
                    title="Dapatkan Lokasi GPS"
                    disabled={isGettingLocation}
                >
                    {isGettingLocation ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 sm:h-5 sm:w-5"></div>
                    ) : (
                        <Navigation className="w-6 h-6 sm:w-5 sm:h-5" />
                    )}
                </motion.button>

                {/* Manual Location Picker Button */}
                <motion.button
                    onClick={onOpenLocationPicker}
                    whileHover={{
                        backgroundColor: "rgb(139 92 246 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-12 h-12 transition-colors border-b border-gray-200 sm:w-10 sm:h-10 ${
                        isPickingLocation
                            ? "text-white bg-violet-600 animate-pulse"
                            : useManualLocation
                            ? "text-violet-600 bg-violet-50"
                            : "text-gray-600 hover:text-violet-600"
                    }`}
                    title={
                        isPickingLocation
                            ? "Mode Pilih Lokasi Aktif - Klik di Peta"
                            : "Pilih Lokasi Manual di Peta"
                    }
                >
                    <MapPin className="w-6 h-6 sm:w-5 sm:h-5" />
                </motion.button>

                {/* Find Nearby Markets Button */}
                <motion.button
                    onClick={onFindNearby}
                    whileHover={{
                        backgroundColor: "rgb(16 185 129 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-12 h-12 text-gray-600 hover:text-emerald-600 transition-colors sm:w-10 sm:h-10 ${
                        nearbyLoading ? "animate-pulse" : ""
                    } ${!hasLocation ? "opacity-50" : ""}`}
                    title="Cari Pasar Terdekat (AI)"
                    disabled={nearbyLoading || !hasLocation}
                >
                    {nearbyLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 sm:h-5 sm:w-5"></div>
                    ) : (
                        <Target className="w-6 h-6 sm:w-5 sm:h-5" />
                    )}
                </motion.button>
            </div>

            {/* Zoom Controls - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden md:block bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <motion.button
                    onClick={onZoomIn}
                    whileHover={{
                        backgroundColor: "rgb(16 185 129 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-emerald-600 transition-colors border-b border-gray-200"
                    title="Zoom In"
                >
                    <Plus className="w-5 h-5" />
                </motion.button>
                <motion.button
                    onClick={onZoomOut}
                    whileHover={{
                        backgroundColor: "rgb(16 185 129 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-emerald-600 transition-colors"
                    title="Zoom Out"
                >
                    <Minus className="w-5 h-5" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ControlButtons;
