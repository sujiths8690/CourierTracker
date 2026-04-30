import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Icon } from "./Helpers";

const createDotIcon = (color, label) => L.divIcon({
  className: "dp-route-map-marker",
  html: `
    <div class="dp-route-map-dot" style="--marker-color:${color}">
      <span>${label}</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

function FitRoute({ points, fitKey }) {
  const map = useMap();
  const fittedKeyRef = useRef(null);

  useEffect(() => {
    if (fittedKeyRef.current === fitKey) return;

    const validPoints = points.filter(Boolean);
    if (!validPoints.length) return;

    fittedKeyRef.current = fitKey;

    map.fitBounds(validPoints, {
      padding: [42, 42],
      maxZoom: 15
    });
  }, [fitKey, map, points]);

  return null;
}

function FollowDriver({ position }) {
  const map = useMap();
  const isUserInteracting = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onUserMove = () => {
      isUserInteracting.current = true;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 3000);
    };

    map.on("dragstart", onUserMove);
    map.on("zoomstart", onUserMove);

    return () => {
      map.off("dragstart", onUserMove);
      map.off("zoomstart", onUserMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [map]);

  useEffect(() => {
    if (!position || isUserInteracting.current) return;

    map.panTo(position, {
      animate: true,
      duration: 0.5
    });
  }, [map, position]);

  return null;
}

export default function DriverRouteMap({ booking, driverPosition, onBack }) {
  const [pickupRoute, setPickupRoute] = useState([]);

  const pickupPoint = booking?.pickupLat && booking?.pickupLng
    ? [booking.pickupLat, booking.pickupLng]
    : null;
  const destinationPoint = booking?.destLat && booking?.destLng
    ? [booking.destLat, booking.destLng]
    : null;
  const deliveryRoute = Array.isArray(booking?.route) ? booking.route : [];

  useEffect(() => {
    if (!driverPosition || !pickupPoint) return;

    const controller = new AbortController();

    const loadRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverPosition[1]},${driverPosition[0]};${pickupPoint[1]},${pickupPoint[0]}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );
        const data = await res.json();
        const coords = data.routes?.[0]?.geometry?.coordinates || [];

        setPickupRoute(coords.map(([lng, lat]) => [lat, lng]));
      } catch (err) {
        if (err.name !== "AbortError") {
          setPickupRoute([driverPosition, pickupPoint]);
        }
      }
    };

    loadRoute();

    return () => controller.abort();
  }, [driverPosition?.[0], driverPosition?.[1], pickupPoint?.[0], pickupPoint?.[1]]);

  const mapCenter = driverPosition || pickupPoint || destinationPoint || [9.9312, 76.2673];
  const fitPoints = useMemo(() => (
    [driverPosition, pickupPoint, destinationPoint].filter(Boolean)
  ), [destinationPoint, driverPosition, pickupPoint]);
  const fitKey = `${booking?.id || "route"}-${booking?.status || "active"}`;

  return (
    <div className="dp-route-map-page">
      <div className="dp-route-map-header">
        <button className="dp-route-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div>
          <p>Directions</p>
          <h2>{booking?.bookingId || `Booking #${booking?.id}`}</h2>
        </div>
      </div>

      <div className="dp-route-map-shell">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="dp-route-map"
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitRoute points={fitPoints} fitKey={fitKey} />
          <FollowDriver position={driverPosition} />

          {pickupRoute.length > 1 && (
            <>
              <Polyline positions={pickupRoute} pathOptions={{ color: "#fff", weight: 9, opacity: 0.95 }} />
              <Polyline positions={pickupRoute} pathOptions={{ color: "#1a73e8", weight: 6, opacity: 0.96 }} />
            </>
          )}

          {deliveryRoute.length > 1 && (
            <>
              <Polyline positions={deliveryRoute} pathOptions={{ color: "#fff", weight: 9, opacity: 0.95 }} />
              <Polyline positions={deliveryRoute} pathOptions={{ color: "#1a73e8", weight: 6, opacity: 0.96 }} />
            </>
          )}

          {driverPosition && (
            <Marker position={driverPosition} icon={createDotIcon("#1a73e8", "D")} />
          )}
          {pickupPoint && (
            <Marker position={pickupPoint} icon={createDotIcon("#f97316", "P")} />
          )}
          {destinationPoint && (
            <Marker position={destinationPoint} icon={createDotIcon("#22c55e", "✓")} />
          )}
        </MapContainer>

        <aside className="dp-route-directions">
          <div className="dp-route-direction-card is-driver">
            {Icon.location("#1a73e8")}
            <div>
              <span>Start</span>
              <strong>Your current location</strong>
            </div>
          </div>
          <div className="dp-route-direction-card is-pickup">
            {Icon.location("#f97316")}
            <div>
              <span>Pickup</span>
              <strong>{booking?.pickupAddress}</strong>
            </div>
          </div>
          <div className="dp-route-direction-card is-drop">
            {Icon.location("#22c55e")}
            <div>
              <span>Delivery</span>
              <strong>{booking?.destAddress}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
