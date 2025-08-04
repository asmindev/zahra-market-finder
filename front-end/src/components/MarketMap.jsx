import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

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

// Custom modern market icon dengan SVG
const createModernMarketIcon = () => {
    const svgIcon = `
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="marketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <!-- Pin Background -->
            <path d="M20 5 C12 5 5 12 5 20 C5 28 20 45 20 45 C20 45 35 28 35 20 C35 12 28 5 20 5 Z"
                  fill="url(#marketGradient)"
                  filter="url(#shadow)"/>
            <!-- Market Building Icon -->
            <rect x="12" y="15" width="16" height="12" rx="2" fill="white" opacity="0.95"/>
            <!-- Roof -->
            <polygon points="20,12 28,16 12,16" fill="white" opacity="0.9"/>
            <!-- Door -->
            <rect x="17" y="22" width="6" height="5" fill="#059669" opacity="0.8"/>
            <!-- Windows -->
            <circle cx="15" cy="19" r="1.5" fill="#10B981" opacity="0.7"/>
            <circle cx="25" cy="19" r="1.5" fill="#10B981" opacity="0.7"/>
        </svg>
    `;

    return new L.divIcon({
        html: svgIcon,
        className: "custom-market-icon",
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
    });
};

const modernMarketIcon = createModernMarketIcon();

export default function MarketMap({ market, className = "" }) {
    const lat = parseFloat(market.latitude);
    const lng = parseFloat(market.longitude);

    // Fallback ke Jakarta jika koordinat tidak valid
    const position = [isNaN(lat) ? -6.2088 : lat, isNaN(lng) ? 106.8456 : lng];

    return (
        <div className={`relative ${className}`}>
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
                    transform: scale(1.1);
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                }
                .leaflet-popup-tip {
                    border-top-color: white !important;
                }
            `}</style>
            <MapContainer
                center={position}
                zoom={15}
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "0.75rem",
                }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={modernMarketIcon}>
                    <Popup className="custom-popup" closeButton={false}>
                        <div className="text-center p-3">
                            <div className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
                                <span className="text-emerald-600">🏪</span>
                                <span>{market.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 flex items-center justify-center space-x-1">
                                <span className="text-emerald-600">📍</span>
                                <span>{market.location}</span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 rounded-md px-2 py-1">
                                {position[0].toFixed(6)},{" "}
                                {position[1].toFixed(6)}
                            </div>
                            <button
                                onClick={() => {
                                    const url = `https://www.google.com/maps?q=${position[0]},${position[1]}`;
                                    window.open(url, "_blank");
                                }}
                                className="mt-3 w-full bg-emerald-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1"
                            >
                                <span>📍</span>
                                <span>Lihat di Google Maps</span>
                            </button>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
