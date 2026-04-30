import MapSection from "../components/MapSection";
import { useState, useEffect } from "react";
import { getSocketUrl } from "../../common/socket";

export default function VehicleMapPage({ vehicle, setPage, t }) {
  const [liveVehicle, setLiveVehicle] = useState(vehicle);

  useEffect(() => {
    const ws = new WebSocket(getSocketUrl());

    ws.onopen = () => {
      console.log("✅ WS CONNECTED");
      ws.send(JSON.stringify({
        type: "SUBSCRIBE_MAP"
      }));
    };

    ws.onmessage = (event) => {
      console.log("📡 RECEIVED:", event.data);
      const data = JSON.parse(event.data);

      if (
        data.type === "VEHICLE_LOCATION" &&
        data.vehicleId === vehicle.id   // ✅ only update this vehicle
      ) {
        setLiveVehicle(prev => ({
          ...prev,
          lastLat: data.lat,
          lastLng: data.lng
        }));
      }
    };

    ws.onerror = (err) => console.log("❌ WS ERROR", err);

    ws.onclose = () => console.log("⚠️ WS CLOSED");

    return () => ws.close();
  }, [vehicle.id]);

  const hasLocation =
    liveVehicle?.lastLat != null && liveVehicle?.lastLng != null;

  const position = hasLocation
    ? [liveVehicle.lastLat, liveVehicle.lastLng]
    : [10, 76];

  return (
    <div className="vmp-root">

      {/* HEADER */}
      <div className="vmp-header">
        <button
          className="vmp-back-btn"
          onClick={() => setPage("app")}
        >
          ← Back
        </button>

        <h2 className="vmp-title">Vehicle Location</h2>

        <div className="vmp-vehicle-id">
          {vehicle?.number}
        </div>
      </div>

      {/* MAIN */}
      <div className="vmp-layout">

        {/* LEFT PANEL */}
        <div className="vmp-left">

          <div className="vmp-card">
            <div className="vmp-card-title">
              {vehicle?.number}
            </div>

            <div className="vmp-meta">
              {vehicle?.type} · {vehicle?.owner}
            </div>

            <div className="vmp-price">
              ₹{vehicle?.pricePerKm ?? "--"} / km
            </div>

            <div className={`vmp-status ${hasLocation ? "live" : "offline"}`}>
              {hasLocation
                ? "● Live tracking active"
                : "● Location not available"}
            </div>
          </div>

        </div>

        {/* MAP */}
        <div className="vmp-map">
          <MapSection
            pos={position}
            vehicles={
              hasLocation
                ? [{
                    id: liveVehicle.id,
                    lat: liveVehicle.lastLat,
                    lng: liveVehicle.lastLng,
                    number: liveVehicle.number,
                    pricePerKm: liveVehicle.pricePerKm
                  }]
                : []
            }
            showVehicles={true}
          />
        </div>

      </div>
    </div>
  );
}
