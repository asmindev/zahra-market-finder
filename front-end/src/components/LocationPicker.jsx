import React, { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import { useMarkets } from "@/hooks/use-market";

// -3.9942
// VITE_DEFAULT_LONGITUDE=122.5423
const DEFAULT_LATITUDE = import.meta.env.VITE_DEFAULT_LATITUDE || -3.9942; // Default to kendari
const DEFAULT_LONGITUDE = import.meta.env.VITE_DEFAULT_LONGITUDE || 122.5423; // Default to kendari

// Custom marker icon for new location selection
const createCustomMarker = () => {
    const svgIcon = `
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#059669"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
            <circle cx="12" cy="12" r="3" fill="#059669"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: "custom-marker",
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
    });
};

// Existing market marker (different color to show it's occupied)
const createExistingMarketMarker = () => {
    const svgIcon = `
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#dc2626"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
            <rect x="11" y="11" width="6" height="6" rx="1" fill="#dc2626"/>
            <rect x="12" y="13" width="1" height="2" fill="white"/>
            <rect x="15" y="13" width="1" height="2" fill="white"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: "existing-market-marker",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
    });
};

// Component to handle map clicks
function LocationMarker({
    position,
    onLocationSelect,
    existingMarkets = [],
    excludeMarketId = null,
}) {
    const [clickWarning, setClickWarning] = useState(null);

    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;

            // Check if clicked location is too close to existing markets (within 100m)
            const tooClose = existingMarkets.find((market) => {
                if (excludeMarketId && market.id === excludeMarketId) {
                    return false; // Skip current market being edited
                }

                const distance = map.distance(
                    [lat, lng],
                    [market.latitude, market.longitude]
                );
                return distance < 100; // 100 meters minimum distance
            });

            if (tooClose) {
                setClickWarning({
                    position: [lat, lng],
                    message: `Lokasi terlalu dekat dengan ${
                        tooClose.name
                    } (${Math.round(
                        map.distance(
                            [lat, lng],
                            [tooClose.latitude, tooClose.longitude]
                        )
                    )}m)`,
                });

                // Clear warning after 3 seconds
                setTimeout(() => setClickWarning(null), 3000);
                return;
            }

            setClickWarning(null);
            onLocationSelect(lat, lng);
        },
    });

    useEffect(() => {
        if (position && position.lat && position.lng) {
            map.flyTo(position, 13);
        }
    }, [position, map]);

    return (
        <>
            {/* Selected position marker */}
            {position && (
                <Marker position={position} icon={createCustomMarker()}>
                    <Popup>
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-800">
                                Lokasi Terpilih
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {position.lat.toFixed(6)},{" "}
                                {position.lng.toFixed(6)}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Existing markets markers */}
            {existingMarkets.map((market) => (
                <Marker
                    key={market.id}
                    position={[market.latitude, market.longitude]}
                    icon={createExistingMarketMarker()}
                >
                    <Popup>
                        <div className="text-center">
                            <div className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
                                <AlertTriangle size={14} />
                                Lokasi Sudah Terisi
                            </div>
                            <div className="text-xs font-semibold text-gray-800 mt-1">
                                {market.name}
                            </div>
                            <div className="text-xs text-gray-600">
                                {market.location}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Warning marker for too close clicks */}
            {clickWarning && (
                <Marker
                    position={clickWarning.position}
                    icon={L.divIcon({
                        html: `<div class="bg-red-100 border-2 border-red-500 rounded-full p-2 text-red-600 font-bold text-xs whitespace-nowrap">!</div>`,
                        className: "warning-marker",
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                    })}
                >
                    <Popup>
                        <div className="text-center">
                            <div className="text-sm font-medium text-red-600">
                                Peringatan!
                            </div>
                            <div className="text-xs text-gray-700 mt-1">
                                {clickWarning.message}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )}
        </>
    );
}

export default function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
    className = "",
    excludeMarketId = null, // ID pasar yang sedang diedit (untuk exclude dari pengecekan)
}) {
    const [position, setPosition] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Initialize position from props
    useEffect(() => {
        if (latitude && longitude) {
            setPosition({
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
            });
        }
    }, [latitude, longitude]);

    const handleLocationSelect = (lat, lng) => {
        const newPosition = { lat, lng };
        setPosition(newPosition);
        onLocationChange(lat.toFixed(6), lng.toFixed(6));
    };

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleLocationSelect(latitude, longitude);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLoadingLocation(false);
                    // Default to Jakarta if geolocation fails
                    handleLocationSelect(-6.2088, 106.8456);
                }
            );
        } else {
            setIsLoadingLocation(false);
            // Default to Jakarta if geolocation not supported
            handleLocationSelect(-6.2088, 106.8456);
        }
    };

    const defaultCenter = position || {
        lat: DEFAULT_LATITUDE,
        lng: DEFAULT_LONGITUDE,
    }; // Jakarta center

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="relative">
                <div className="w-full h-128 rounded-lg overflow-hidden">
                    <MapContainer
                        center={[defaultCenter.lat, defaultCenter.lng]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={position}
                            onLocationSelect={handleLocationSelect}
                        />
                    </MapContainer>
                </div>

                {/* Instructions */}
                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Klik pada peta untuk memilih lokasi</span>
                </div>

                {/* Coordinates display */}
                {/* {position && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                        <div className="text-xs text-gray-600">
                            <span className="font-medium">
                                Koordinat terpilih:
                            </span>
                            <div className="font-mono mt-1">
                                Lat: {position.lat.toFixed(6)}, Lng:{" "}
                                {position.lng.toFixed(6)}
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
}
