import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import { X, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/map";

// Custom marker icon for manual location selection
const createManualLocationMarker = () => {
    const svgIcon = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#2563eb"/>
            <circle cx="16" cy="16" r="7" fill="white"/>
            <circle cx="16" cy="16" r="4" fill="#2563eb"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: "custom-manual-location-marker",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
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
            map.flyTo(position, 15, {
                animate: true,
                duration: 0.8,
            });
        }
    }, [position, map]);

    return (
        <>
            {position && (
                <Marker position={position} icon={createManualLocationMarker()}>
                    <Popup>
                        <div className="text-center p-1">
                            <div className="text-sm font-semibold text-blue-600 flex items-center justify-center gap-1">
                                <MapPin size={14} />
                                Lokasi Asal
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {position.lat.toFixed(6)},{" "}
                                {position.lng.toFixed(6)}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )}
        </>
    );
}

export default function ManualLocationPicker({
    isOpen,
    onClose,
    onLocationConfirm,
    currentLocation,
}) {
    const [position, setPosition] = useState(null);
    const [isLoadingGPS, setIsLoadingGPS] = useState(false);

    // Initialize position from current location
    useEffect(() => {
        if (isOpen && currentLocation) {
            setPosition({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
            });
        } else if (isOpen && !currentLocation) {
            // Default position jika tidak ada current location
            setPosition({
                lat: DEFAULT_LATITUDE,
                lng: DEFAULT_LONGITUDE,
            });
        }
    }, [isOpen, currentLocation]);

    const handleLocationSelect = (lat, lng) => {
        setPosition({ lat, lng });
    };

    const handleConfirm = () => {
        if (position) {
            onLocationConfirm(position.lat, position.lng);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLoadingGPS(true);
            navigator.geolocation.getCurrentPosition(
                (gpsPosition) => {
                    const { latitude, longitude } = gpsPosition.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    setIsLoadingGPS(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLoadingGPS(false);
                    alert("Gagal mendapatkan lokasi GPS");
                }
            );
        } else {
            alert("Browser tidak mendukung geolocation");
        }
    };

    if (!isOpen) return null;

    const defaultCenter = position || {
        lat: DEFAULT_LATITUDE,
        lng: DEFAULT_LONGITUDE,
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin size={24} />
                            Pilih Lokasi Asal
                        </h2>
                        <p className="text-xs text-blue-100 mt-1">
                            Klik pada peta untuk memilih lokasi asal Anda
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={[defaultCenter.lat, defaultCenter.lng]}
                        zoom={15}
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

                    {/* GPS Button */}
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={isLoadingGPS}
                        className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        title="Gunakan Lokasi GPS Saya"
                    >
                        <Navigation
                            size={20}
                            className={`text-blue-600 ${
                                isLoadingGPS ? "animate-pulse" : ""
                            }`}
                        />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 space-y-3">
                    {position && (
                        <div className="bg-white border rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                                Koordinat Terpilih:
                            </div>
                            <div className="font-mono text-sm text-gray-700">
                                Lat: {position.lat.toFixed(6)}, Lng:{" "}
                                {position.lng.toFixed(6)}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!position}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <MapPin size={16} className="mr-2" />
                            Konfirmasi Lokasi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
