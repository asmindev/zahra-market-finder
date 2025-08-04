import { MapPin, X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";

const MarketList = ({ markets, onClose, onMarketClick }) => {
    return (
        <AnimatePresence>
            {markets && markets.length > 0 && (
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8,
                    }}
                    className="absolute inset-x-3 bottom-20 h-96 bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl z-[1000] flex flex-col sm:inset-x-4 sm:rounded-xl md:left-4 md:right-auto md:w-96 md:h-[400px]"
                >
                    {/* Header - Mobile optimized */}
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            delay: 0.05,
                            duration: 0.25,
                        }}
                        className="flex items-center justify-between p-5 border-b border-gray-200 bg-white/95 backdrop-blur-sm rounded-t-2xl flex-shrink-0 sm:p-4 sm:rounded-t-xl"
                    >
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 sm:text-lg">
                                Daftar Pasar
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-xs">
                                {markets.length} pasar ditemukan
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors sm:p-1"
                        >
                            <X className="w-6 h-6 sm:w-5 sm:h-5" />
                        </button>
                    </motion.div>

                    {/* Market List - Mobile friendly scrolling */}
                    <div className="flex-1 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                delay: 0.1,
                                duration: 0.3,
                                staggerChildren: 0.05,
                                delayChildren: 0.1,
                            }}
                            className="h-full overflow-y-auto p-4 sm:p-3"
                        >
                            <div className="space-y-3 pb-3 sm:space-y-2 sm:pb-2">
                                {markets?.map((market) => (
                                    <motion.button
                                        key={market.id}
                                        onClick={() => onMarketClick(market)}
                                        className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-white hover:border-emerald-200 transition-all group shadow-sm sm:p-3 sm:rounded-lg"
                                    >
                                        <div className="space-y-2 sm:space-y-1">
                                            <h4 className="font-semibold text-gray-900 group-hover:text-emerald-700 text-base sm:text-sm">
                                                {market.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 flex items-center space-x-2 sm:text-xs sm:space-x-1">
                                                <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0 sm:h-3 sm:w-3" />
                                                <span className="truncate">
                                                    {market.location}
                                                </span>
                                            </p>
                                            {market.category && (
                                                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800 sm:px-2 sm:py-0.5 sm:text-xs">
                                                    {market.category}
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Gradient overlay for better visual */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/95 to-transparent pointer-events-none rounded-b-2xl sm:rounded-b-xl" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MarketList;
