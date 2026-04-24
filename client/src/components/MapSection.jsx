import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

// 🔥 Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔥 Custom Pickup Marker (clean UI)
const pickupIcon = L.divIcon({
  className: "pickup-marker",
  html: `<div class="pickup-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 🔥 Vehicle Marker
const createVehicleIcon = (v) => {
  return L.divIcon({
    className: "vehicle-marker",
    html: `
      <div class="vehicle-wrapper">
        🚚
        <div class="vehicle-price">₹${v.pricePerKm || 0}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function MapSection({
  pos,
  onSelect,
  vehicles = [],
  showVehicles = false,
}) {
  const [position, setPosition] = useState(pos || [10, 76]);

  const API_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

  function LocationPicker() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;

        setPosition([lat, lng]);

        let address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lng}&format=json`
          );

          const data = await res.json();
          if (data?.display_name) {
            address = data.display_name;
          }
        } catch (err) {
          console.log("Reverse geocode failed");
        }

        onSelect?.({
          lat,
          lng,
          name: address,
        });
      },
    });

    return position ? (
      <Marker position={position} icon={pickupIcon} />
    ) : null;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <LocationPicker />

      {/* 🚚 Vehicles */}
      {showVehicles &&
        vehicles.map((v) =>
          v.lat && v.lng ? (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v)}
            />
          ) : null
        )}
    </MapContainer>
  );
}