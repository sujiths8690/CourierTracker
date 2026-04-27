import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import truckImg from "../assets/truck.png";
import pickupImg from "../assets/pickup.png";

// 🔥 Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔵 Pickup marker
const pickupIcon = L.divIcon({
  className: "pickup-marker",
  html: `<div class="pickup-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 🔴 Destination marker
const destinationIcon = L.divIcon({
  className: "destination-marker",
  html: `<div class="destination-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 🔵 Current location dot
const userLocationIcon = L.divIcon({
  className: "user-location",
  html: `<div class="user-location-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 🚚 Vehicle marker (with number + animation)
const createVehicleIcon = (v, selected) => {
  const img = v.type === "PICKUP" ? pickupImg : truckImg;

  return L.divIcon({
    className: "vehicle-marker",
    html: `
      <div class="vehicle-wrapper">

        <img src="${img}" class="vehicle-img" />

        ${
          selected
            ? `
          <div class="vehicle-popup">
            <div class="vehicle-number">
              ${v.number || "No Number"}
            </div>
            <div class="vehicle-price">
              ₹${v.pricePerKm ?? "--"}/km
            </div>
          </div>
        `
            : ""
        }

      </div>
    `,
    iconSize: [60, 40],
    iconAnchor: [20, 20],
  });
};

// 🎯 Auto fit bounds (VERY IMPORTANT)
function FitBounds({ points }) {
  const map = useMap();
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (!points || points.length === 0) return;

    // 🔥 only run once
    if (hasFitted) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });

    setHasFitted(true);
  }, [points, hasFitted]);

  return null;
}

export default function MapSection({
  pos,
  onSelect,
  vehicles = [],
  showVehicles = false,
  clickable = true,

  route = [],
  destination,
  destinationRoute = [],
  onVehicleSelect,
  selectedVehicleId,
  onClearVehicle,

  isCurrentLocation
}) {
  const [position, setPosition] = useState(pos || [10, 76]);
  const API_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

  // 🟢 Click to select pickup
  function LocationPicker() {
    useMapEvents({
      async click(e) {
        if (!clickable) return;

        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          if (data?.display_name) address = data.display_name;
        } catch (err) {}

        onSelect?.({ lat, lng, name: address });
        onClearVehicle?.();
      },
    });


  }

  // 🔁 update center
  useEffect(() => {
    if (pos) setPosition(pos);
  }, [pos]);

  // 📍 All points for auto zoom
  const allPoints = [
    ...(route || []),
    ...(destinationRoute || []),
    ...(vehicles || [])
      .filter(v => v.lat && v.lng)
      .map(v => [v.lat, v.lng]),
    ...(position ? [position] : []),
    ...(destination ? [destination] : [])
  ];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      {/* 🔥 IMPORTANT FIX */}
      <FitBounds points={allPoints} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <LocationPicker />

      {/* 📍 Current location */}
      {isCurrentLocation && position && (
        <Marker position={position} icon={userLocationIcon} />
      )}

      {/* 📍 Pickup marker (ALWAYS SHOW) */}
    {position && (
      <Marker position={position} icon={pickupIcon} />
    )}

      {/* 🚚 Vehicles */}
      {showVehicles &&
        vehicles.map((v) =>
          v.lat && v.lng ? (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v, v.id === selectedVehicleId)}
              eventHandlers={{
                click: () => onVehicleSelect?.(v.id),
              }}
            />
          ) : null
        )}

      {/* 📍 Destination */}
      {destination && (
        <Marker position={destination} icon={destinationIcon} />
      )}

      {/* 🔵 Route (vehicle → pickup) */}
      {route.length > 0 && (
        <Polyline
          positions={route}
          pathOptions={{
            color: "#007bff",
            weight: 5,
          }}
        />
      )}

      {/* 🟢 Destination route */}
      {destinationRoute.length > 0 && (
        <Polyline
          positions={destinationRoute}
          pathOptions={{
            color: "green",
            weight: 5,
            dashArray: "6, 10",
          }}
        />
      )}
    </MapContainer>
  );
}