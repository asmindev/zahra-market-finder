const LoadingOverlay = ({ loading }) => {
    if (!loading) return null;

    return (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-[1000]">
            <div className="text-center px-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3 sm:h-8 sm:w-8 sm:mb-2"></div>
                <p className="text-base text-gray-600 sm:text-sm">
                    Memuat peta...
                </p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
