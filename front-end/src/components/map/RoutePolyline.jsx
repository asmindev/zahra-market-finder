import { useEffect } from "react";
import { Polyline, Popup } from "react-leaflet";

const RoutePolyline = ({
    routeData,
    onClearRoute,
    isTrackingLocation,
    onStopTracking,
}) => {
    useEffect(() => {
        console.log("RoutePolyline mounted with data:", routeData);
    }, [routeData]);

    if (!routeData || !routeData.coordinates) {
        return null;
    }

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const positions = routeData.coordinates.map((coord) => [
        coord[1],
        coord[0],
    ]);

    const formatDistance = (distance) => {
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(1)} km`;
        }
        return `${Math.round(distance)} m`;
    };

    const formatDuration = (duration) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);

        if (hours > 0) {
            return `${hours}j ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <Polyline
            positions={positions}
            pathOptions={{
                color: "#2563eb",
                weight: 10,
                opacity: 1,
                className: "route-polyline",
            }}
        >
            <Popup>
                <div className="p-3 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">
                            Rute ke {routeData.destination?.name}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1 text-gray-600">
                                        Jarak
                                    </td>
                                    <td className="py-1 font-medium text-right">
                                        {formatDistance(routeData.distance)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-gray-600">
                                        Waktu
                                    </td>
                                    <td className="py-1 font-medium text-right">
                                        {formatDuration(routeData.duration)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Tracking Status dan Controls */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        {isTrackingLocation && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600 font-medium">
                                        Tracking Aktif
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Rute akan terupdate otomatis saat Anda
                                    bergerak
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {isTrackingLocation && (
                                <button
                                    onClick={onStopTracking}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-red-700 transition-colors"
                                >
                                    ⏹️ Stop Tracking
                                </button>
                            )}
                            <button
                                onClick={onClearRoute}
                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors"
                            >
                                🗑️ Hapus Rute
                            </button>
                        </div>
                    </div>
                </div>
            </Popup>
        </Polyline>
    );
};

export default RoutePolyline;
