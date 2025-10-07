import L from "leaflet";
import { getPolylineColor } from "@/utils/map";

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

// Custom modern market icon untuk multiple markets
export const createMarketIcon = () => {
    const svgIcon = `
        <svg width="35" height="45" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="marketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path d="M17.5 5 C11 5 5 11 5 17.5 C5 24 17.5 40 17.5 40 C17.5 40 30 24 30 17.5 C30 11 24 5 17.5 5 Z"
                  fill="url(#marketGradient)"
                  filter="url(#shadow)"/>
            <rect x="11" y="13" width="13" height="9" rx="1.5" fill="white" opacity="0.95"/>
            <polygon points="17.5,11 23,14 12,14" fill="white" opacity="0.9"/>
            <rect x="15" y="17" width="5" height="4" fill="#059669" opacity="0.8"/>
            <circle cx="13.5" cy="16" r="1" fill="#10B981" opacity="0.7"/>
            <circle cx="21.5" cy="16" r="1" fill="#10B981" opacity="0.7"/>
        </svg>
    `;

    return new L.divIcon({
        html: svgIcon,
        className: "custom-market-icon",
        iconSize: [35, 45],
        iconAnchor: [17.5, 45],
        popupAnchor: [0, -45],
    });
};

// Custom user location icon
export const createUserLocationIcon = () => {
    const svgIcon = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
                </linearGradient>
                <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
                </filter>
            </defs>
            <!-- Outer white ring for better visibility -->
            <circle cx="16" cy="16" r="12" fill="white" stroke="#E5E7EB" stroke-width="2" filter="url(#userShadow)"/>
            <!-- Main blue circle -->
            <circle cx="16" cy="16" r="10" fill="url(#userGradient)"/>
            <!-- Inner white ring -->
            <circle cx="16" cy="16" r="6" fill="white" opacity="0.95"/>
            <!-- Center dot -->
            <circle cx="16" cy="16" r="3" fill="#1D4ED8"/>
        </svg>
    `;

    return new L.divIcon({
        html: svgIcon,
        className: "custom-user-location-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

// Custom nearby market icon dengan ranking
export const createNearbyMarketIcon = (index) => {
    const color = getPolylineColor(index);
    const isClosest = index === 0;

    const svgIcon = `
        <svg width="${isClosest ? 40 : 35}" height="${
        isClosest ? 50 : 45
    }" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="nearbyGradient${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color}AA;stop-opacity:1" />
                </linearGradient>
                <filter id="nearbyShadow${index}" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/>
                </filter>
            </defs>
            <path d="M17.5 5 C11 5 5 11 5 17.5 C5 24 17.5 40 17.5 40 C17.5 40 30 24 30 17.5 C30 11 24 5 17.5 5 Z"
                  fill="url(#nearbyGradient${index})"
                  filter="url(#nearbyShadow${index})"
                  stroke="white"
                  stroke-width="${isClosest ? 2 : 1}"/>

            <!-- Ranking number -->
            <circle cx="17.5" cy="17.5" r="${
                isClosest ? 8 : 7
            }" fill="white" opacity="0.95"/>
            <text x="17.5" y="22" text-anchor="middle" font-family="Arial, sans-serif"
                  font-size="${
                      isClosest ? 12 : 10
                  }" font-weight="bold" fill="${color}">
                ${index + 1}
            </text>

            ${
                isClosest
                    ? `
            <!-- Crown icon for closest -->
            <polygon points="14,10 17.5,7 21,10 19,12 16,12" fill="#FFD700" opacity="0.8"/>
            `
                    : ""
            }
        </svg>
    `;

    return new L.divIcon({
        html: svgIcon,
        className: "custom-nearby-market-icon",
        iconSize: [isClosest ? 40 : 35, isClosest ? 50 : 45],
        iconAnchor: [isClosest ? 20 : 17.5, isClosest ? 50 : 45],
        popupAnchor: [0, isClosest ? -50 : -45],
    });
};

// Custom manual location icon
export const createManualLocationIcon = () => {
    const svgIcon = `
        <svg width="35" height="45" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="manualGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
                </linearGradient>
                <filter id="manualShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
                </filter>
            </defs>
            <path d="M17.5 5 C11 5 5 11 5 17.5 C5 24 17.5 40 17.5 40 C17.5 40 30 24 30 17.5 C30 11 24 5 17.5 5 Z"
                  fill="url(#manualGradient)"
                  filter="url(#manualShadow)"
                  stroke="white"
                  stroke-width="2"/>
            <circle cx="17.5" cy="17.5" r="8" fill="white" opacity="0.95"/>
            <circle cx="17.5" cy="17.5" r="5" fill="#8B5CF6"/>
            <!-- Pin icon -->
            <path d="M17.5 13 L17.5 18 M15 15.5 L20 15.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `;

    return new L.divIcon({
        html: svgIcon,
        className: "custom-manual-location-icon",
        iconSize: [35, 45],
        iconAnchor: [17.5, 45],
        popupAnchor: [0, -45],
    });
};
