import { MapPin } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

const MarketInfo = ({
    markets,
    nearbyMarkets,
    showNearbyMarkets,
    onToggleMarketList,
    onResetNearby,
}) => {
    return (
        <>
            {/* Market Count Info - Mobile First, Clickable */}
            {markets && markets.length > 0 && (
                <motion.button
                    onClick={onToggleMarketList}
                    whileHover={{
                        scale: 1.03,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg z-[1000] hover:bg-white transition-colors cursor-pointer sm:bottom-4 sm:left-4 sm:px-3 sm:py-2 sm:rounded-lg"
                >
                    <motion.p
                        className="text-sm font-medium text-gray-700 flex items-center space-x-2 sm:text-xs sm:font-normal"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                    >
                        <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-emerald-600 sm:h-3 sm:w-3" />
                            <span>
                                {showNearbyMarkets && nearbyMarkets?.length
                                    ? `${nearbyMarkets.length} terdekat`
                                    : `${markets.length} pasar`}
                            </span>
                        </span>
                        <motion.span
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="text-emerald-600 text-lg sm:text-base"
                        >
                            •
                        </motion.span>
                        <span className="text-emerald-600 font-semibold text-sm sm:text-xs">
                            Lihat semua
                        </span>
                    </motion.p>
                </motion.button>
            )}

            {/* Reset Button - Tampil saat ada nearby markets */}
            {showNearbyMarkets && nearbyMarkets?.length > 0 && (
                <motion.button
                    onClick={onResetNearby}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    whileHover={{
                        scale: 1.03,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-20 left-3 bg-blue-600/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg z-[1000] hover:bg-blue-700 transition-colors cursor-pointer text-white sm:bottom-20 sm:left-4 sm:px-3 sm:py-2 sm:rounded-lg"
                >
                    <motion.p
                        className="text-sm font-medium flex items-center space-x-2 sm:text-xs"
                        initial={{ opacity: 0.9 }}
                        whileHover={{ opacity: 1 }}
                    >
                        <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 sm:h-3 sm:w-3" />
                            <span>Kembali ke semua pasar</span>
                        </span>
                    </motion.p>
                </motion.button>
            )}
        </>
    );
};

export default MarketInfo;
