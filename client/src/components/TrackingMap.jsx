import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";

function Recenter({ pos }) {
  const map = useMap();

  useEffect(() => {
    if (pos) {
      map.setView(pos, map.getZoom(), { animate: true });
    }
  }, [pos]);

  return null;
}

export default function TrackingMap({
  vehiclePos,
  fullRoute,
  coveredPath,
  booking
}) {
  const defaultCenter = [9.9312, 76.2673];

  const center =
    vehiclePos ||
    (booking?.pickupLat && booking?.pickupLng
      ? [booking.pickupLat, booking.pickupLng]
      : defaultCenter);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Recenter pos={vehiclePos} />

      {/* 🚚 Vehicle */}
      {vehiclePos && <Marker position={vehiclePos} />}

      {/* 🔵 FULL ROUTE */}
      {fullRoute && (
        <Polyline
          positions={fullRoute}
          pathOptions={{
            color: "#999",
            weight: 5,
            opacity: 0.3,
            dashArray: "8, 10"
          }}
        />
      )}

      {/* 🟢 COVERED PATH */}
      {coveredPath.length > 0 && (
        <Polyline
          positions={coveredPath}
          pathOptions={{
            color: "#28a745",
            weight: 6
          }}
        />
      )}
    </MapContainer>
  );
}
