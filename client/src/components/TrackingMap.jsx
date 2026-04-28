import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import truckIconImg from "../assets/truck.png";
import pickupIconImg from "../assets/pickup.png";


function Recenter({ pos }) {
  const map = useMap();

  const isUserInteracting = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const onUserMove = () => {
      isUserInteracting.current = true;

      // reset timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 3000); // ⏱️ 3 seconds inactivity
    };

    // detect user actions
    map.on("dragstart", onUserMove);
    map.on("zoomstart", onUserMove);

    return () => {
      map.off("dragstart", onUserMove);
      map.off("zoomstart", onUserMove);
    };
  }, [map]);

  useEffect(() => {
    if (!pos) return;

    // ❌ don't move if user interacting
    if (isUserInteracting.current) return;

    // ✅ smooth follow
    map.panTo(pos, {
      animate: true,
      duration: 0.5
    });

  }, [pos]);

  return null;
}

const createVehicleIcon = (type) => {
  return L.divIcon({
    className: "tracking-vehicle-marker",
    html: `
      <div class="vehicle-wrapper">
        <img 
          src="${type?.toLowerCase() === "pickup" ? pickupIconImg : truckIconImg}" 
        />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function TrackingMap({ vehiclePos, booking, coveredPath }) {

  const defaultCenter = [9.9312, 76.2673];
  console.log("ROUTE:", booking?.route);

  const center =
    vehiclePos ||
    (booking?.pickupLat && booking?.pickupLng
      ? [booking.pickupLat, booking.pickupLng]
      : defaultCenter);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Recenter pos={vehiclePos} />

      {/* 🚚 Vehicle */}
      {vehiclePos && (
        <Marker
          position={vehiclePos}
          icon={createVehicleIcon(booking?.VehicleDetails?.type)}
        />
      )}

      {/* 🔵 FULL ROUTE (from booking) */}
      {booking?.route && (
        <Polyline
          positions={booking.route}
          pathOptions={{
            color: "#999",
            weight: 5,
            opacity: 0.3,
            dashArray: "8, 10"
          }}
        />
      )}

      {/* 🟢 COVERED PATH */}
      
    </MapContainer>
  );
}


