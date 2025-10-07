import { Polyline } from "react-leaflet";
import {
    getPolylineColor,
    getPolylineOpacity,
    getPolylineWeight,
} from "@/utils/map";

const MapPolylines = ({
    showNearbyMarkets,
    nearbyMarkets,
    userLocation,
    manualLocation,
    useManualLocation,
}) => {
    // Gunakan manual location jika tersedia, jika tidak gunakan user location
    const originLocation =
        useManualLocation && manualLocation ? manualLocation : userLocation;

    if (!showNearbyMarkets || !nearbyMarkets?.length || !originLocation) {
        return null;
    }

    return (
        <>
            {nearbyMarkets.map((market, index) => {
                const lat = parseFloat(market.latitude);
                const lng = parseFloat(market.longitude);

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                    <Polyline
                        key={`polyline-${market.id}`}
                        positions={[
                            [originLocation.lat, originLocation.lng],
                            [lat, lng],
                        ]}
                        color={getPolylineColor(index)}
                        opacity={getPolylineOpacity(index)}
                        weight={getPolylineWeight(index)}
                        dashArray={index === 0 ? "0" : "5, 5"} // Solid untuk terdekat, dashed untuk lainnya
                        className="nearby-polyline"
                        interactive={false} // Non-interactive agar tidak mengganggu map
                    />
                );
            })}
        </>
    );
};

export default MapPolylines;
