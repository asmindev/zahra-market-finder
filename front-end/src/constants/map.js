// Map configuration constants
export const DEFAULT_LATITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE) || -6.2088;
export const DEFAULT_LONGITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE) || 106.8456;
export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 12;
export const MAX_ROUTE = parseInt(import.meta.env.VITE_MAX_ROUTE) || 5;

// Polyline colors for nearby markets - Semua warna sama (biru tua)
export const POLYLINE_COLORS = [
    "#1D4ED8", // Biru tua untuk semua
    "#1D4ED8", // Biru tua untuk semua
    "#1D4ED8", // Biru tua untuk semua
    "#1D4ED8", // Biru tua untuk semua
    "#1D4ED8", // Biru tua untuk semua
];

// Polyline opacities for nearby markets - Semua terang penuh
export const POLYLINE_OPACITIES = [1.0, 1.0, 1.0, 1.0, 1.0];

// Polyline weights for nearby markets - Semua sama tebal
export const POLYLINE_WEIGHTS = [4, 4, 4, 4, 4];
