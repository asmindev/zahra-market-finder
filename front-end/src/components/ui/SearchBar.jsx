import { Search } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-3 left-3 right-3 z-[1000] sm:top-4 sm:left-4 sm:right-4"
        >
            <div className="w-full md:w-96">
                <div className="flex items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                        <motion.input
                            whileFocus={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            type="text"
                            placeholder="Cari pasar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm sm:py-2 sm:text-sm md:bg-white"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SearchBar;
