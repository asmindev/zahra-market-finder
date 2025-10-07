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
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [manualLocation, setManualLocation] = useState(null);
    const [useManualLocation, setUseManualLocation] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);

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
        // Gunakan manual location jika tersedia, jika tidak gunakan user location
        const originLocation =
            useManualLocation && manualLocation ? manualLocation : userLocation;

        if (!originLocation) {
            triggerHapticFeedback();
            toast(
                "Lokasi asal belum ditentukan. Silakan pilih lokasi GPS atau pilih manual di peta."
            );
            return;
        }

        triggerHapticFeedback();
        try {
            await findNearbyMarkets(
                {
                    latitude: originLocation.lat,
                    longitude: originLocation.lng,
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
        // Gunakan manual location jika tersedia, jika tidak gunakan user location
        const originLocation =
            useManualLocation && manualLocation ? manualLocation : userLocation;

        if (!originLocation) {
            triggerHapticFeedback();
            toast.error(
                "Lokasi asal belum ditentukan. Silakan pilih lokasi GPS atau pilih manual di peta."
            );
            return;
        }

        setIsLoadingRoute(true);
        triggerHapticFeedback();

        try {
            const { lng: fromLon, lat: fromLat } = originLocation;
            console.log("Navigating to market:", market);
            console.log("Origin location:", originLocation);
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
                    origin: originLocation, // Simpan origin untuk tracking
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

                // Mulai tracking lokasi untuk update rute real-time (hanya jika menggunakan GPS)
                if (!useManualLocation) {
                    startLocationTracking(market);
                }
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

    // Handler untuk membuka location picker
    const handleOpenLocationPicker = () => {
        triggerHapticFeedback();
        setIsPickingLocation(true);
        toast.info("🎯 Klik di peta untuk memilih lokasi asal");
    };

    // Handler untuk menutup location picker
    const handleCloseLocationPicker = () => {
        setShowLocationPicker(false);
    };

    // Handler untuk toggle picking mode
    const handleTogglePickingMode = () => {
        triggerHapticFeedback();
        const newState = !isPickingLocation;
        setIsPickingLocation(newState);

        if (newState) {
            toast.info("🎯 Klik di peta untuk memilih lokasi asal");
        } else {
            toast.success("Mode pemilihan lokasi dinonaktifkan");
        }
    };

    // Handler untuk map click (untuk pemilihan lokasi langsung di peta)
    const handleMapClick = (e) => {
        if (!isPickingLocation) {
            // Jika tidak dalam mode picking, tidak lakukan apa-apa
            return;
        }

        // Set lokasi manual dari klik peta
        const { lat, lng } = e.latlng;
        const newLocation = { lat, lng };
        setManualLocation(newLocation);
        setUseManualLocation(true);
        setIsPickingLocation(false); // Matikan mode picking setelah memilih

        // Fokus map ke lokasi yang dipilih
        const mapInstance = map || mapRef.current;
        if (mapInstance) {
            mapInstance.setView([lat, lng], 15, {
                animate: true,
                duration: 1,
            });
        }

        toast.success("✅ Lokasi asal berhasil dipilih dari peta");
    }; // Handler untuk set manual location
    const handleSetManualLocation = (lat, lng) => {
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
        setManualLocation(newLocation);
        setUseManualLocation(true);
        setShowLocationPicker(false);
        triggerHapticFeedback();

        // Fokus map ke lokasi manual
        const mapInstance = map || mapRef.current;
        if (mapInstance) {
            mapInstance.setView([newLocation.lat, newLocation.lng], 15, {
                animate: true,
                duration: 1,
            });
        }

        toast.success("Lokasi asal manual berhasil dipilih");
    };

    // Handler untuk reset ke GPS location
    const handleResetToGPSLocation = () => {
        setUseManualLocation(false);
        setManualLocation(null);
        triggerHapticFeedback();
        toast.success("Kembali menggunakan lokasi GPS");
    };

    // Get current active location (manual or GPS)
    const getActiveLocation = () => {
        return useManualLocation && manualLocation
            ? manualLocation
            : userLocation;
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
        showLocationPicker,
        manualLocation,
        useManualLocation,
        isPickingLocation,
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
        handleOpenLocationPicker,
        handleCloseLocationPicker,
        handleSetManualLocation,
        handleResetToGPSLocation,
        getActiveLocation,
        handleMapClick,
        handleTogglePickingMode,
    };
};

export default useMapHandlers;
