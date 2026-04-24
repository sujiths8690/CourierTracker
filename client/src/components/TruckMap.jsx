import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🚚 Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
  iconSize: [40, 40],
});

const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

const destIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [30, 30],
});

export default function TruckMap({ booking, t }) {
  const mapRef = useRef(null);

  const [truckPos, setTruckPos] = useState(null);

  // 📍 Pickup & Destination
  const pickup = booking?.pickupLat && booking?.pickupLng
    ? [booking.pickupLat, booking.pickupLng]
    : null;

  const destination = booking?.destLat && booking?.destLng
    ? [booking.destLat, booking.destLng]
    : null;

  // 🚚 INITIAL POSITION
  useEffect(() => {
    if (booking?.lastLat && booking?.lastLng) {
      setTruckPos([booking.lastLat, booking.lastLng]);
    } else if (pickup) {
      setTruckPos(pickup);
    }
  }, [booking]);

  // 🔌 WEBSOCKET LIVE TRACKING
  useEffect(() => {
    if (!booking?.id) return;

    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WS connected");

      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE",
          bookingId: booking.id,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "LOCATION_UPDATE") {
        console.log("LIVE LOCATION:", data);

        setTruckPos([data.lat, data.lng]);
      }

      if (data.type === "TRIP_COMPLETED") {
        console.log("Trip completed");
      }
    };

    ws.onclose = () => {
      console.log("WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, [booking]);

  // 🧭 AUTO CENTER MAP
  useEffect(() => {
    if (truckPos && mapRef.current) {
      mapRef.current.setView(truckPos, 15);
    }
  }, [truckPos]);

  // ❌ SAFETY
  if (!pickup) {
    return (
      <div style={{ padding: 20, color: t.text }}>
        No location data available
      </div>
    );
  }

  return (
    <div style={{ height: 400, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={pickup}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        {/* 🌍 MAP TILE */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 PICKUP */}
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {/* 🎯 DESTINATION */}
        {destination && (
          <Marker position={destination} icon={destIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* 🚚 TRUCK */}
        {truckPos && (
          <Marker position={truckPos} icon={truckIcon}>
            <Popup>Truck Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}