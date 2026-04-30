import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import truckIconImg from "../../assets/truck.png";
import pickupIconImg from "../../assets/pickup.png";


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

const getCargoState = (status) => {
  if (status === "LOADING") return "loading";
  if (status === "COMPLETED") return "delivering";
  if (status === "ONGOING") return "onboard";
  return "";
};

const createVehicleIcon = (vehicle, status) => {
  const type = vehicle?.type;
  const number = vehicle?.number || "";

  return L.divIcon({
    className: "tracking-vehicle-marker",
    html: `
      <div class="tracking-vehicle-wrapper">
        <img 
          src="${type?.toLowerCase() === "pickup" ? pickupIconImg : truckIconImg}" 
        />
        ${
          number
            ? `<div class="tracking-number-plate">${number}</div>`
            : ""
        }
      </div>
    `,
    iconSize: [80, 58],
    iconAnchor: [40, 22],
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

const createCheckmarkIcon = () => {
  return L.divIcon({
    className: "checkmark-marker",
    html: `
      <div class="checkmark-wrapper">
        <div class="checkmark-ring ring1"></div>
        <div class="checkmark-ring ring2"></div>
        <div class="checkmark-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
};

const getNearestRouteIndex = (route, position) => {
  if (!route?.length || !position) return -1;

  let closestIndex = 0;
  let closestDistance = Infinity;

  route.forEach(([lat, lng], index) => {
    const latDiff = Number(lat) - Number(position[0]);
    const lngDiff = Number(lng) - Number(position[1]);
    const distance = latDiff * latDiff + lngDiff * lngDiff;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};


const trafficColor = (label) => {
  if (label === "heavy") return "#ef4444";
  if (label === "moderate") return "#f59e0b";
  if (label === "clear") return "#22c55e";
  return "#94a3b8";
};


export default function TrackingMap({ vehiclePos, booking, coveredPath, traffic }) {

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

  const deliveryTrail = (() => {
    if (booking?.status !== "ONGOING" || !booking?.route?.length || !vehiclePos) {
      return [];
    }

    const closestIndex = getNearestRouteIndex(booking.route, vehiclePos);

    if (closestIndex < 0) return [];

    return [
      ...booking.route.slice(0, closestIndex + 1),
      vehiclePos
    ];
  })();

  const center =
    vehiclePos ||
    (booking?.pickupLat && booking?.pickupLng
      ? [booking.pickupLat, booking.pickupLng]
      : defaultCenter);

  const speed = Number.isFinite(Number(traffic?.speed))
    ? Math.round(Number(traffic.speed))
    : null;
  const speedColor = trafficColor(traffic?.label);
  const speedProgress = Math.min((speed || 0) / 80, 1);
  const ringCircumference = 2 * Math.PI * 34;

  return (
    <div className="tracking-map-shell">
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", minHeight: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Recenter pos={vehiclePos} />

      {/* 🚚 Vehicle - Hide if delivered */}
      {vehiclePos && booking?.status !== "COMPLETED" && (
        <Marker
          position={vehiclePos}
          icon={createVehicleIcon(booking?.VehicleDetails, booking?.status)}
        />
      )}

      {/* 🟠 Pickup */}
      {booking?.pickupLat && booking?.pickupLng && (
        <Marker
          position={[booking.pickupLat, booking.pickupLng]}
          icon={createPulseIcon("#f97316")} // orange
        />
      )}

      {/* 🟢 Destination - Show checkmark when delivered */}
      {booking?.destLat && booking?.destLng && (
        <Marker
          position={[booking.destLat, booking.destLng]}
          icon={booking?.status === "COMPLETED" ? createCheckmarkIcon() : createPulseIcon("#22c55e")}
        />
      )}

      {/* 🔵 FULL ROUTE (from booking) - Hide if delivered */}
      {booking?.route && booking.route.length > 0 && booking?.status !== "COMPLETED" && (
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

      {deliveryTrail.length > 1 && (
        <>
          <Polyline
            positions={deliveryTrail}
            pathOptions={{
              color: "#0a5c2e",
              weight: 8,
              opacity: 0.9,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          <Polyline
            positions={deliveryTrail}
            pathOptions={{
              color: "#22c55e",
              weight: 5,
              opacity: 1,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          <Polyline
            positions={deliveryTrail}
            pathOptions={{
              color: "#86efac",
              weight: 3,
              dashArray: "10, 20",
              className: "flow-line",
              lineCap: "round"
            }}
          />
        </>
      )}
      
    </MapContainer>
    <div className="tracking-speed-gauge" style={{ "--speed-color": speedColor }}>
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle className="speed-ring-bg" cx="42" cy="42" r="34" />
        <circle
          className="speed-ring-fg"
          cx="42"
          cy="42"
          r="34"
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringCircumference * (1 - speedProgress)}
        />
      </svg>
      <div className="speed-gauge-content">
        <strong>{speed ?? "--"}</strong>
        <span>km/h</span>
      </div>
    </div>
    </div>
  );
}
