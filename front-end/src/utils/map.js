import {
    POLYLINE_COLORS,
    POLYLINE_OPACITIES,
    POLYLINE_WEIGHTS,
} from "@/constants/map";

// Helper function untuk haptic feedback di mobile
export const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
        navigator.vibrate(10); // Light haptic feedback
    }
};

// Fungsi untuk mendapatkan warna berdasarkan urutan pasar terdekat
export const getPolylineColor = (index) => {
    return POLYLINE_COLORS[Math.min(index, POLYLINE_COLORS.length - 1)];
};

// Fungsi untuk mendapatkan opacity berdasarkan urutan
export const getPolylineOpacity = (index) => {
    return POLYLINE_OPACITIES[Math.min(index, POLYLINE_OPACITIES.length - 1)];
};

// Fungsi untuk mendapatkan weight berdasarkan urutan
export const getPolylineWeight = (index) => {
    return POLYLINE_WEIGHTS[Math.min(index, POLYLINE_WEIGHTS.length - 1)];
};
