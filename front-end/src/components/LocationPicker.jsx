import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

// -3.9942
// VITE_DEFAULT_LONGITUDE=122.5423
const DEFAULT_LATITUDE = import.meta.env.VITE_DEFAULT_LATITUDE || -3.9942; // Default to kendari
const DEFAULT_LONGITUDE = import.meta.env.VITE_DEFAULT_LONGITUDE || 122.5423; // Default to kendari

// Custom marker icon
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

// Component to handle map clicks
function LocationMarker({ position, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect(lat, lng);
        },
    });

    useEffect(() => {
        if (position && position.lat && position.lng) {
            map.flyTo(position, 13);
        }
    }, [position, map]);

    return position ? (
        <Marker position={position} icon={createCustomMarker()} />
    ) : null;
}

export default function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
    className = "",
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
                <div className="w-full h-64 rounded-lg overflow-hidden">
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
                {position && (
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
                )}
            </div>
        </div>
    );
}
