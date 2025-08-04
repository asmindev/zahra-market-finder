import { Marker } from "react-leaflet";
import {
    createMarketIcon,
    createUserLocationIcon,
    createNearbyMarketIcon,
} from "@/utils/icons";

const MapMarkers = ({
    markets,
    nearbyMarkets,
    showNearbyMarkets,
    userLocation,
    onMarkerClick,
}) => {
    const marketIcon = createMarketIcon();
    const userLocationIcon = createUserLocationIcon();

    return (
        <>
            {/* Render markets berdasarkan kondisi nearby */}
            {!showNearbyMarkets || !nearbyMarkets?.length
                ? markets?.map((market) => {
                      const lat = parseFloat(market.latitude);
                      const lng = parseFloat(market.longitude);

                      if (isNaN(lat) || isNaN(lng)) return null;

                      return (
                          <Marker
                              key={market.id}
                              position={[lat, lng]}
                              icon={marketIcon}
                              eventHandlers={{
                                  click: () => onMarkerClick(market),
                              }}
                          />
                      );
                  })
                : nearbyMarkets?.map((market, index) => {
                      const lat = parseFloat(market.latitude);
                      const lng = parseFloat(market.longitude);

                      if (isNaN(lat) || isNaN(lng)) return null;

                      return (
                          <Marker
                              key={market.id}
                              position={[lat, lng]}
                              icon={createNearbyMarketIcon(index)}
                              eventHandlers={{
                                  click: () => onMarkerClick(market),
                              }}
                          />
                      );
                  })}

            {/* Render user location marker */}
            {userLocation && (
                <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userLocationIcon}
                />
            )}
        </>
    );
};

export default MapMarkers;
