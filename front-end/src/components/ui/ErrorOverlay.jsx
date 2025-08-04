const ErrorOverlay = ({ error, nearbyError }) => {
    return (
        <>
            {/* Main Error */}
            {error && (
                <div className="absolute top-20 left-3 right-3 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg z-[1000] sm:top-16 sm:left-4 sm:right-4">
                    <p className="text-sm">Error: {error}</p>
                </div>
            )}

            {/* Nearby Markets Error */}
            {nearbyError && (
                <div className="absolute top-28 left-3 right-3 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg z-[1000] sm:top-24 sm:left-4 sm:right-4">
                    <p className="text-sm">
                        Error Pasar Terdekat: {nearbyError}
                    </p>
                </div>
            )}
        </>
    );
};

export default ErrorOverlay;
