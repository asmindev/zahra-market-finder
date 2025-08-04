import { useState } from "react";
import { toast } from "sonner";
import { triggerHapticFeedback } from "@/utils/map";
import L from "leaflet";

const useMapHandlers = ({
    mapRef,
    // navigate, // TODO: Use this for navigation features
    // nearbyMarkets, // TODO: Use this for nearby markets state
    findNearbyMarkets,
    clearResults,
}) => {
    const [map, setMap] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [showMarketCard, setShowMarketCard] = useState(false);
    const [showMarketList, setShowMarketList] = useState(false);
    const [showNearbyMarkets, setShowNearbyMarkets] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [watchId, setWatchId] = useState(null);

    // Handler untuk klik marker dengan haptic feedback
    const handleMarkerClick = (market) => {
        console.log("handleMarkerClick called with market:", market);
        console.log("Current showMarketCard state:", showMarketCard);
        triggerHapticFeedback();
        setSelectedMarket(market);
        setShowMarketCard(true);
        console.log("After setShowMarketCard(true)");
    };

    // Handler untuk menutup market card
    const closeMarketCard = () => {
        setShowMarketCard(false);
        setSelectedMarket(null);
    };

    // Handler untuk toggle market list
    const toggleMarketList = () => {
        triggerHapticFeedback();
        setShowMarketList(!showMarketList);
    };

    // Handler untuk mencari pasar terdekat
    const handleFindNearbyMarkets = async () => {
        if (!userLocation) {
            triggerHapticFeedback();
            toast(
                "Lokasi Anda belum diketahui. Silakan klik tombol lokasi terlebih dahulu."
            );
            return;
        }

        triggerHapticFeedback();
        try {
            await findNearbyMarkets(
                {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                },
                {
                    use_ga: true,
                }
            );
            setShowNearbyMarkets(true);
        } catch (error) {
            console.error("Error finding nearby markets:", error);
            toast.error("Gagal mencari pasar terdekat. Silakan coba lagi.");
        }
    };

    // Handler untuk get user location
    const handleGetUserLocation = () => {
        if (navigator.geolocation) {
            setIsGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userPos = {
                        lat: latitude,
                        lng: longitude,
                    };
                    setUserLocation(userPos);
                    setIsGettingLocation(false);

                    const mapInstance = map || mapRef.current;
                    if (mapInstance) {
                        mapInstance.setView([latitude, longitude], 15, {
                            animate: true,
                            duration: 1,
                        });
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsGettingLocation(false);
                    toast.error(
                        "Gagal mendapatkan lokasi. Pastikan GPS aktif."
                    );
                }
            );
        } else {
            console.error("Geolocation not supported");
            toast.error("Browser tidak mendukung geolocation.");
        }
    };

    // Handler untuk klik pasar di list
    const handleMarketFromList = (market) => {
        triggerHapticFeedback();
        setSelectedMarket(market);
        setShowMarketCard(true);

        // Fokus map ke lokasi market
        const lat = parseFloat(market.latitude);
        const lng = parseFloat(market.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            const mapInstance = map || mapRef.current;
            if (mapInstance) {
                try {
                    mapInstance.setView([lat, lng], 16, {
                        animate: true,
                        duration: 1.5,
                    });
                } catch (error) {
                    console.error("Error setting map view:", error);
                }
            }
        }
    };

    // Handler untuk reset nearby markets
    const handleResetNearby = () => {
        setShowNearbyMarkets(false);
        clearResults();
    };

    // Handler untuk zoom
    const handleZoomIn = () => {
        const mapInstance = map || mapRef.current;
        if (mapInstance) {
            mapInstance.setZoom(mapInstance.getZoom() + 1);
        }
    };

    const handleZoomOut = () => {
        const mapInstance = map || mapRef.current;
        if (mapInstance) {
            mapInstance.setZoom(mapInstance.getZoom() - 1);
        }
    };

    // Handler untuk mendapatkan rute OSRM
    const handleNavigateToOSM = async (market) => {
        if (!userLocation) {
            triggerHapticFeedback();
            toast.error(
                "Lokasi Anda belum diketahui. Silakan klik tombol lokasi terlebih dahulu."
            );
            return;
        }

        setIsLoadingRoute(true);
        triggerHapticFeedback();

        try {
            const { lng: fromLon, lat: fromLat } = userLocation;
            console.log("Navigating to market:", market);
            console.log("User location:", userLocation);
            const { longitude: toLon, latitude: toLat } = {
                longitude: market.longitude,
                latitude: market.latitude,
            };

            const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRouteData({
                    coordinates: route.geometry.coordinates,
                    distance: route.distance,
                    duration: route.duration,
                    destination: market,
                });

                // Zoom to fit the route
                const mapInstance = map || mapRef.current;
                if (mapInstance && route.geometry.coordinates) {
                    const bounds = route.geometry.coordinates.reduce(
                        (bounds, coord) => {
                            return bounds.extend([coord[1], coord[0]]); // Leaflet uses [lat, lng]
                        },
                        new L.LatLngBounds()
                    );

                    mapInstance.fitBounds(bounds, { padding: [20, 20] });
                }

                toast.success(
                    `Rute ditemukan! Jarak: ${(route.distance / 1000).toFixed(
                        1
                    )} km, Waktu: ${Math.round(route.duration / 60)} menit`
                );

                // Mulai tracking lokasi untuk update rute real-time
                startLocationTracking(market);
            } else {
                toast.error("Rute tidak dapat ditemukan");
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            toast.error("Gagal mendapatkan rute. Silakan coba lagi.");
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Handler untuk menghapus rute
    const clearRoute = () => {
        setRouteData(null);
        triggerHapticFeedback();
        toast.success("Rute dihapus");

        // Stop tracking jika sedang aktif
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setIsTrackingLocation(false);
        }
    };

    // Fungsi untuk update rute dengan lokasi baru
    const updateRoute = async (newUserLocation, destination) => {
        try {
            const { lng: fromLon, lat: fromLat } = newUserLocation;
            const { longitude: toLon, latitude: toLat } = destination;

            const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRouteData({
                    coordinates: route.geometry.coordinates,
                    distance: route.distance,
                    duration: route.duration,
                    destination: destination,
                });
            }
        } catch (error) {
            console.error("Error updating route:", error);
            // Tidak tampilkan error toast untuk background update
        }
    };

    // Fungsi untuk mulai tracking lokasi real-time
    const startLocationTracking = (destination) => {
        if (!navigator.geolocation) {
            toast.error("Browser tidak mendukung geolocation.");
            return;
        }

        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 2000, // Update maksimal setiap 2 detik
        };

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newUserLocation = {
                    lat: latitude,
                    lng: longitude,
                };

                console.log("Location updated:", newUserLocation);
                setUserLocation(newUserLocation);

                // Update rute dengan lokasi baru
                if (destination) {
                    updateRoute(newUserLocation, destination);
                }
            },
            (error) => {
                console.error("Error tracking location:", error);
                toast.error("Error tracking lokasi. Tracking dihentikan.");
                setIsTrackingLocation(false);
                setWatchId(null);
            },
            options
        );

        setWatchId(id);
        setIsTrackingLocation(true);
        toast.success(
            "📍 Tracking lokasi dimulai - Rute akan terupdate otomatis"
        );
    };

    // Fungsi untuk stop tracking lokasi
    const stopLocationTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setIsTrackingLocation(false);
            toast.success("Tracking lokasi dihentikan");
        }
    };

    return {
        map,
        setMap,
        searchQuery,
        setSearchQuery,
        userLocation,
        isGettingLocation,
        selectedMarket,
        showMarketCard,
        showMarketList,
        showNearbyMarkets,
        routeData,
        isLoadingRoute,
        isTrackingLocation,
        setShowMarketList,
        setShowNearbyMarkets,
        handleMarkerClick,
        closeMarketCard,
        toggleMarketList,
        handleFindNearbyMarkets,
        handleGetUserLocation,
        handleMarketFromList,
        handleResetNearby,
        handleZoomIn,
        handleZoomOut,
        handleNavigateToOSM,
        clearRoute,
        stopLocationTracking,
    };
};

export default useMapHandlers;
