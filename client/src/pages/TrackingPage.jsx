import { useEffect, useState, useMemo } from "react";
import TrackingMap from "../components/TrackingMap";

export default function BookingTrackingPage({ booking, setPage, t }) {

  const [vehiclePos, setVehiclePos] = useState([
    booking.vehicle.lat,
    booking.vehicle.lng
  ]);

  const [coveredPath, setCoveredPath] = useState([]);

  // 🔥 WebSocket live tracking
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "SUBSCRIBE_MAP" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "VEHICLE_LOCATION" &&
          data.vehicleId === booking.vehicle.id) {

        const newPos = [data.lat, data.lng];

        setVehiclePos(newPos);

        // ✅ store covered path
        setCoveredPath(prev => [...prev, newPos]);
      }
    };

    return () => ws.close();
  }, [booking.vehicle.id]);

  // 🔥 progress calculation
  const progress = useMemo(() => {
    if (!booking.route || booking.route.length === 0) return 0;

    const total = booking.route.length;
    const covered = coveredPath.length;

    return Math.min((covered / total) * 100, 100);
  }, [coveredPath, booking.route]);

  return (
    <div className="bcp-root">
      <div className="bcp-inner">

        {/* HEADER */}
        <div className="bcp-topbar">
          <button className="bcp-back-btn" onClick={() => setPage("dashboard")}>
            ← Back
          </button>
          <h2 className="bcp-page-title">Live Tracking</h2>
        </div>

        <div className="bcp-cards">

          {/* LEFT */}
          <div className="bcp-left">

            {/* DETAILS CARD */}
            <div className="bcp-card">
              <div className="bcp-card-body">

                <div className="bcp-summary-row top-row">
                  <div>
                    <p className="bcp-summary-item-label">Customer</p>
                    <p className="bcp-summary-item-value">
                      {booking.customer.name}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p className="bcp-summary-item-label">Vehicle</p>
                    <p className="bcp-summary-item-value">
                      {booking.vehicle.number}
                    </p>
                  </div>
                </div>

                <div className="bcp-summary-row">
                  <p className="bcp-summary-item-label">Owner</p>
                  <p className="bcp-summary-item-value">
                    {booking.vehicle.owner}
                  </p>
                </div>

                <div className="bcp-summary-row cost-row">
                  <div className="bcp-cost-box">
                    ₹{booking.totalCost}
                  </div>
                </div>

              </div>
            </div>

            {/* MAP */}
            <div className="bcp-card">
              <div className="bcp-map-wrap" style={{ height: 400 }}>
                <TrackingMap
                  vehiclePos={vehiclePos}
                  fullRoute={booking.route}
                  coveredPath={coveredPath}
                  booking={booking}
                />
              </div>

              {/* PROGRESS */}
              <div style={{ padding: 12 }}>
                <div style={{
                  height: 8,
                  background: "#eee",
                  borderRadius: 6,
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "var(--bcp-accent)",
                    transition: "width 0.5s"
                  }} />
                </div>

                <p style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                  {progress.toFixed(0)}% completed
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}


