// Map configuration constants
export const DEFAULT_LATITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE) || -6.2088;
export const DEFAULT_LONGITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE) || 106.8456;
export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 12;
export const MAX_ROUTE = parseInt(import.meta.env.VITE_MAX_ROUTE) || 5;

// Polyline colors for nearby markets (closest to furthest)
export const POLYLINE_COLORS = [
    "#1D4ED8", // Biru tua untuk terdekat
    "#3B82F6", // Biru medium untuk kedua
    "#60A5FA", // Biru muda untuk ketiga
    "#93C5FD", // Biru sangat muda untuk keempat
    "#BFDBFE", // Biru pucat untuk kelima dan seterusnya
];

// Polyline opacities for nearby markets
export const POLYLINE_OPACITIES = [0.8, 0.7, 0.6, 0.5, 0.4];

// Polyline weights for nearby markets
export const POLYLINE_WEIGHTS = [4, 3, 3, 2, 2];
