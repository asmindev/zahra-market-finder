import { useRef } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { AnimatePresence } from "motion/react";
import { useMarkets, useNearbyMarkets } from "@/hooks/use-market";
import { useNavigate } from "react-router";

// Import modular components
import SearchBar from "@/components/ui/SearchBar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import ErrorOverlay from "@/components/ui/ErrorOverlay";
import ControlButtons from "@/components/ui/ControlButtons";
import MarketInfo from "@/components/ui/MarketInfo";
import MapMarkers from "@/components/map/MapMarkers";
import MapPolylines from "@/components/map/MapPolylines";
import RoutePolyline from "@/components/map/RoutePolyline";
import MarketList from "@/components/overlays/MarketList";
import NearbyMarketsList from "@/components/overlays/NearbyMarketsList";
import MarketDetailCard from "@/components/overlays/MarketDetailCard";

// Import custom hook for handlers
import useMapHandlers from "@/hooks/use-map-handlers";

// Import constants
import {
    DEFAULT_LATITUDE,
    DEFAULT_LONGITUDE,
    DEFAULT_ZOOM,
} from "@/constants/map";

// Fix untuk default marker icons di React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Home() {
    const navigate = useNavigate();
    const mapRef = useRef(null);

    const { markets, loading, error } = useMarkets({
        page: 1,
        per_page: 50,
    });

    const {
        nearbyMarkets,
        loading: nearbyLoading,
        error: nearbyError,
        meta: nearbyMeta,
        findNearbyMarkets,
        clearResults,
    } = useNearbyMarkets();

    // Use the custom hook for all handlers and state
    const {
        setMap,
        searchQuery,
        setSearchQuery,
        selectedMarket,
        showMarketCard,
        showMarketList,
        setShowMarketList,
        userLocation,
        isGettingLocation,
        showNearbyMarkets,
        setShowNearbyMarkets,
        routeData,
        isLoadingRoute,
        isTrackingLocation,
        handleMarkerClick,
        closeMarketCard,
        toggleMarketList,
        handleFindNearbyMarkets,
        handleMarketFromList,
        handleZoomIn,
        handleZoomOut,
        handleGetUserLocation,
        handleNavigateToOSM,
        clearRoute,
        stopLocationTracking,
    } = useMapHandlers({
        mapRef,
        navigate,
        nearbyMarkets,
        findNearbyMarkets,
        clearResults,
    });

    // Komponen untuk mendapatkan map instance
    const MapEventHandler = () => {
        const mapInstance = useMapEvents({
            ready: () => {
                console.log("Map ready, setting instance:", mapInstance);
                setMap(mapInstance);
                mapRef.current = mapInstance;
            },
            whenReady: () => {
                console.log("Map when ready, setting instance:", mapInstance);
                setMap(mapInstance);
                mapRef.current = mapInstance;
            },
            load: () => {
                console.log("Map loaded, setting instance:", mapInstance);
                setMap(mapInstance);
                mapRef.current = mapInstance;
            },
        });
        return null;
    };

    return (
        <div className="h-screen flex bg-white">
            {/* Main Content - Map Container Full Width */}
            <div className="flex-1 relative bg-white">
                {/* Map Container - selalu full width */}
                <div className="h-full relative w-full">
                    <style>{`
                    .custom-market-icon {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .custom-market-icon svg {
                        transition: transform 0.2s ease;
                    }
                    .custom-market-icon:hover svg {
                        transform: scale(1.15);
                    }

                    .custom-user-location-icon {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .custom-user-location-icon svg {
                        transition: transform 0.3s ease;
                        animation: userLocationPulse 2s infinite;
                        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
                    }

                    @keyframes userLocationPulse {
                        0%, 100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.8;
                            transform: scale(1.2);
                        }
                    }

                    .leaflet-popup-content-wrapper {
                        border-radius: 12px !important;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                        padding: 0 !important;
                    }
                    .leaflet-popup-content {
                        margin: 0 !important;
                        border-radius: 12px !important;
                    }
                    .leaflet-popup-tip {
                        border-top-color: white !important;
                    }

                    /* Mobile touch improvements */
                    .leaflet-container {
                        background: transparent !important;
                        touch-action: pan-x pan-y;
                        -webkit-overflow-scrolling: touch;
                    }

                    /* Prevent any overlay backgrounds */
                    .leaflet-overlay-pane {
                        background: none !important;
                    }

                    /* Enhanced mobile interaction for markers */
                    @media (hover: none) and (pointer: coarse) {
                        .custom-market-icon svg {
                            transform: scale(1.05);
                        }
                        .custom-market-icon:active svg {
                            transform: scale(1.25);
                        }
                    }

                    /* Polyline animations and styling */
                    .leaflet-interactive {
                        transition: all 0.3s ease;
                    }

                    .leaflet-interactive:hover {
                        filter: drop-shadow(0 2px 8px rgba(29, 78, 216, 0.4));
                    }

                    /* Animated polyline for nearby markets */
                    @keyframes polyline-draw {
                        from {
                            stroke-dashoffset: 100;
                        }
                        to {
                            stroke-dashoffset: 0;
                        }
                    }

                    /* Custom styling for polylines */
                    .nearby-polyline {
                        animation: polyline-draw 1.5s ease-out;
                        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
                    }

                    /* Route polyline styling */
                    .route-polyline {
                        filter: drop-shadow(0 2px 6px rgba(37, 99, 235, 0.4));
                    }

                    /* Route animation */
                    @keyframes route-pulse {
                        0%, 100% {
                            opacity: 0.8;
                        }
                        50% {
                            opacity: 1;
                        }
                    }

                    .route-polyline {
                        animation: route-pulse 2s infinite;
                    }

                    /* Route distance tooltip styling */
                    .route-distance-tooltip {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .route-distance-tooltip .leaflet-tooltip-content {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                `}</style>

                    <MapContainer
                        center={[DEFAULT_LATITUDE, DEFAULT_LONGITUDE]}
                        zoom={DEFAULT_ZOOM}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                        zoomControl={false}
                        ref={(mapInstance) => {
                            if (mapInstance) {
                                mapRef.current = mapInstance;
                                setMap(mapInstance);
                            }
                        }}
                        whenCreated={(mapInstance) => {
                            if (mapInstance) {
                                mapRef.current = mapInstance;
                                setMap(mapInstance);
                                console.log(
                                    "Map created via whenCreated:",
                                    mapInstance
                                );
                            }
                        }}
                    >
                        <MapEventHandler />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Map Markers */}
                        <MapMarkers
                            markets={markets}
                            nearbyMarkets={nearbyMarkets}
                            showNearbyMarkets={showNearbyMarkets}
                            userLocation={userLocation}
                            onMarkerClick={handleMarkerClick}
                        />

                        {/* Map Polylines */}
                        <MapPolylines
                            nearbyMarkets={nearbyMarkets}
                            showNearbyMarkets={showNearbyMarkets}
                            userLocation={userLocation}
                        />

                        {/* Route Polyline */}
                        <RoutePolyline
                            routeData={routeData}
                            onClearRoute={clearRoute}
                            isTrackingLocation={isTrackingLocation}
                            onStopTracking={stopLocationTracking}
                        />
                    </MapContainer>

                    {/* Search Bar */}
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {/* Loading Overlay */}
                    <LoadingOverlay loading={loading} />

                    {/* Error Overlays */}
                    <ErrorOverlay error={error} nearbyError={nearbyError} />

                    {/* Market Info */}
                    <MarketInfo
                        markets={markets}
                        nearbyMarkets={nearbyMarkets}
                        showNearbyMarkets={showNearbyMarkets}
                        onToggleMarketList={toggleMarketList}
                        onResetNearby={() => {
                            setShowNearbyMarkets(false);
                            clearResults();
                        }}
                    />

                    {/* Control Buttons */}
                    <ControlButtons
                        onGetLocation={handleGetUserLocation}
                        onFindNearby={handleFindNearbyMarkets}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        isGettingLocation={isGettingLocation}
                        nearbyLoading={nearbyLoading}
                        userLocation={userLocation}
                    />

                    {/* Market List Overlay */}
                    <AnimatePresence>
                        {showMarketList && (
                            <MarketList
                                markets={markets}
                                onMarketClick={handleMarketFromList}
                                onClose={() => setShowMarketList(false)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Nearby Markets Overlay */}
                    <AnimatePresence>
                        {showNearbyMarkets &&
                            nearbyMarkets &&
                            nearbyMarkets.length > 0 && (
                                <NearbyMarketsList
                                    nearbyMarkets={nearbyMarkets}
                                    nearbyMeta={nearbyMeta}
                                    onMarketClick={handleMarketFromList}
                                    onClose={() => {
                                        setShowNearbyMarkets(false);
                                        clearResults();
                                    }}
                                />
                            )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Market Detail Card */}
            <MarketDetailCard
                showMarketCard={showMarketCard}
                selectedMarket={selectedMarket}
                onClose={closeMarketCard}
                onNavigateToDetail={() =>
                    navigate(`/market/${selectedMarket.id}`)
                }
                onNavigateToLocation={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedMarket.latitude},${selectedMarket.longitude}`;
                    window.open(url, "_blank");
                }}
                onNavigateToOSM={handleNavigateToOSM}
                isLoadingRoute={isLoadingRoute}
            />
        </div>
    );
}
