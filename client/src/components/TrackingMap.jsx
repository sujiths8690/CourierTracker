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

const createPulseIcon = (color) => {
  return L.divIcon({
    className: "pulse-marker",
    html: `
      <div class="pulse-container">
        <div class="pulse-dot" style="background:${color}"></div>
        <div class="pulse-wave" style="border-color:${color}"></div>
        <div class="pulse-wave delay" style="border-color:${color}"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};


export default function TrackingMap({ vehiclePos, booking, coveredPath }) {

  const defaultCenter = [9.9312, 76.2673];
  console.log("ROUTE:", booking?.route);
  console.log("Route length", booking?.route?.length)

  const fullRoute = (() => {
    if (!booking?.route) return [];

    // before pickup → use vehicle → pickup
    if (!coveredPath || coveredPath.length === 0) {
      if (vehiclePos && booking.pickupLat) {
        return [
          vehiclePos,
          [booking.pickupLat, booking.pickupLng],
          ...booking.route
        ];
      }
    }

    // after pickup → normal route
    return booking.route;
  })();

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

      {/* 🟠 Pickup */}
      {booking?.pickupLat && booking?.pickupLng && (
        <Marker
          position={[booking.pickupLat, booking.pickupLng]}
          icon={createPulseIcon("#f97316")} // orange
        />
      )}

      {/* 🟢 Destination */}
      {booking?.destLat && booking?.destLng && (
        <Marker
          position={[booking.destLat, booking.destLng]}
          icon={createPulseIcon("#22c55e")} // green
        />
      )}

      {/* 🔵 FULL ROUTE (from booking) */}
      {booking?.route && booking.route.length > 0 && (
        <>
          {/* 🔲 Outline */}
          <Polyline
            positions={booking.route}
            pathOptions={{
              color: "#555",
              weight: 8,
              opacity: 0.6,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* ⚪ Main grey */}
          <Polyline
            positions={fullRoute}
            pathOptions={{
              color: "#9ca3af",
              weight: 5,
              opacity: 0.8,
              lineJoin: "round",
              lineCap: "round"
            }}
          />
        </>
      )}

      {/* 🟢 COVERED PATH */}
      {coveredPath && coveredPath.length > 0 && (
        <>
          {/* 🔲 Outline */}
          <Polyline
            positions={coveredPath}
            pathOptions={{
              color: "#0a5c2e", // dark green
              weight: 8,
              opacity: 0.9,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* 🟢 Main green */}
          <Polyline
            positions={coveredPath}
            pathOptions={{
              color: "#22c55e", // bright green
              weight: 5,
              opacity: 1,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* ✨ Flow animation */}
          <Polyline
            positions={coveredPath}
            pathOptions={{
              color: "#86efac", // light green glow
              weight: 3,
              dashArray: "10, 20",
              className: "flow-line",
              lineCap: "round"
            }}
          />
        </>
      )}
      
    </MapContainer>
  );
}


