import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import truckIconImg from "../assets/truck.png";
import pickupIconImg from "../assets/pickup.png"; // if you have
import { useRef } from "react";
import { Polyline } from "react-leaflet";

// 🔥 Handle map clicks
import axios from "axios";

const KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

function FitBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 0) {
      map.fitBounds(route, { padding: [50, 50] });
    }
  }, [route, map]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      try {
        const res = await axios.get(
          "https://us1.locationiq.com/v1/reverse",
          {
            params: {
              key: KEY,
              lat,
              lon: lng,
              format: "json",
            },
          }
        );

        const name = res.data.display_name;

        onSelect({
          lat,
          lng,
          name,
        });

      } catch (err) {
        console.error("Reverse geocode error:", err);

        // fallback
        onSelect({
          lat,
          lng,
          name: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
      }
    },
  });

  return null;
}

// 🔥 Recenter when position changes
function RecenterMap({ pos, route }) {
  const map = useMap();

  useEffect(() => {
    // ✅ If route exists → fit route (priority)
    if (route && route.length > 0) {
      map.fitBounds(route, { padding: [50, 50] });
      return;
    }

    // ✅ Only center once when pickup is first set
    if (pos) {
      map.setView(pos, 13);
    }

  }, [route]); // 🔥 IMPORTANT: NOT watching pos

  return null;
}

export default function MapSection({
  pos,
  isCurrentLocation= false,
  onSelect,
  vehicles = [],
  showVehicles = false,
  clickable = false,
  route,
  routeMeta,  
  destination,
  destinationRoute,
  destinationMeta,
  onVehicleSelect,
  selectedVehicleId 
}) {

  const userLocationIcon = L.divIcon({
    className: "",
    html: `<div class="user-location-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const getMidPoint = (coords) => {
    if (!coords || coords.length === 0) return null;
    return coords[Math.floor(coords.length / 2)];
  };

  const createVehicleIcon = (v, selectedVehicleId) => {
    const formatDuration = (minutes) => {
      if (!minutes) return "";
      const hrs = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);

      if (hrs === 0) return `${mins} min`;
      if (mins === 0) return `${hrs} hr`;
      return `${hrs} hr ${mins} min`;
    };

    const etaText = v.eta ? formatDuration(v.eta) : "";

    return L.divIcon({
      className: "vehicle-marker",
      html: `
        <div class="vehicle-wrapper ${v.id === selectedVehicleId ? "selected" : ""}">

          ${
            v.id === selectedVehicleId
              ? `
              <div class="vehicle-label">
                <div class="vehicle-number">${v.number}</div>
                <div class="vehicle-price">₹${v.pricePerKm || 0}</div>
              </div>
              `
              : ""
          }

          <img src="${v.type.toLowerCase() === "pickup" ? pickupIconImg : truckIconImg}" />

          ${
            etaText
              ? `<div class="eta-box">${etaText}</div>`
              : ""
          }

        </div>
      `,
      iconSize: [50, 70],
      iconAnchor: [25, 60],
    });
  };

  return (
    <MapContainer
      center={pos}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <RecenterMap pos={pos} />

      {/* ✅ Only enable click if needed */}
      {clickable && onSelect && (
        <MapClickHandler onSelect={onSelect} />
      )}

      {/* ✅ Main marker (customer / pickup / vehicle) */}
      {pos && (
        <Marker
          position={pos}
          icon={isCurrentLocation ? userLocationIcon : undefined}
        />
      )}

      {destination && (
        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {destinationRoute && destinationRoute.length > 0 && (
        <>
          {/* Outline */}
          <Polyline
            positions={destinationRoute}
            pathOptions={{
              color: "#0b3d91",
              weight: 8,
              opacity: 0.9,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* Main blue */}
          <Polyline
            positions={destinationRoute}
            pathOptions={{
              color: "#4285F4",
              weight: 5,
              opacity: 1,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* ✨ Animated flow */}
          <Polyline
            positions={destinationRoute}
            pathOptions={{
              color: "#9ec9ff", // light blue glow
              weight: 3,
              dashArray: "10, 20",
              className: "flow-line",
              lineCap: "round"
            }}
          />
        </>
      )}

      {/* {destinationRoute && destinationMeta && (
        <Marker
          position={getMidPoint(destinationRoute)}
          icon={L.divIcon({
            className: "route-label",
            html: `<div class="route-box green">
                     ${destinationMeta.distance.toFixed(1)} km · ${Math.round(destinationMeta.time)} min
                  </div>`
          })}
        />
      )} */}

      {/* ✅ Show vehicles only when needed */}
      {showVehicles &&
        vehicles.map((v) =>
          v.lat && v.lng ? (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v, selectedVehicleId)}
              eventHandlers={{
                click: () => {
                  onVehicleSelect?.(v.id);
                }
              }}
            >
            </Marker>
          ) : null
        )}

        {route && route.length > 0 && <FitBounds route={route} />}

      {route && route.length > 0 && (
        <>
          {/* Outline */}
          <Polyline
            positions={route}
            pathOptions={{
              color: "#b85c00",
              weight: 8,
              opacity: 0.9,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* Main orange */}
          <Polyline
            positions={route}
            pathOptions={{
              color: "#FF8C00",
              weight: 5,
              opacity: 1,
              lineJoin: "round",
              lineCap: "round"
            }}
          />

          {/* ✨ Animated flow */}
          <Polyline
            positions={route}
            pathOptions={{
              color: "#ffd199", // light orange flow
              weight: 3,
              dashArray: "10, 20",
              className: "flow-line",
              lineCap: "round"
            }}
          />
        </>
      )}

    {/* {route && routeMeta && (
      <Marker
        position={getMidPoint(route)}
        icon={L.divIcon({
          className: "route-label",
          html: `<div class="route-box">
                  🚚 ${routeMeta.distance.toFixed(1)} km · ${Math.round(routeMeta.time)} min
                </div>`
        })}
      />
    )} */}
        </MapContainer>
  );
}
