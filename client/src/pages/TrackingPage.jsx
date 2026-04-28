import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById } from "../redux/features/booking/bookingActions";
import { selectSelectedBooking } from "../redux/features/booking/bookingSelector";
import { useEffect, useState, useMemo } from "react";
import TrackingMap from "../components/TrackingMap";
import L from "leaflet";
import truckIconImg from "../assets/truck.png";
import pickupIconImg from "../assets/pickup.png";
import { fetchCurrentLocation, fetchTrackingLogs } from "../redux/features/tracking/trackingActions";



export default function TrackingPage({ bookingId, setPage, t }) {
  const dispatch = useDispatch();
  const booking = useSelector(selectSelectedBooking);

  const [vehiclePos, setVehiclePos] = useState(null);
  const [coveredPath, setCoveredPath] = useState([]);

  console.log("BOOKING ID:", bookingId);

  const logs = useSelector(state => state.tracking.logs);
  console.log("LOGS:", logs);

// ✅ fetch booking
  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [bookingId, dispatch]);

  // useEffect(() => {
  //   if (bookingId) {
  //     dispatch(fetchTrackingLogs(bookingId));
  //   }
  // }, [bookingId, dispatch]);

  // ✅ convert logs → path
  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const path = logs.map(l => [l.lat, l.lng]);

    setCoveredPath(path);

    // last point = vehicle position
    setVehiclePos(path[path.length - 1]);
  }, [logs]);

  // 🔥 Initialize vehicle position from booking
  useEffect(() => {
    if (!bookingId) return;

    const ws = new WebSocket("ws://192.168.1.84:3003");

    ws.onopen = () => {
      console.log("✅ WS Connected");

      // 🔥 IMPORTANT
      setCoveredPath([]);
      setVehiclePos(null);

      ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        bookingId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("📡 WS DATA:", data);

      if (data.type === "VEHICLE_LOCATION") {
        const newPos = [data.lat, data.lng];

        // ✅ only move marker
        setVehiclePos(newPos);

        // ❌ remove this
        // setCoveredPath(prev => [...prev, newPos]);
      }
    };

    ws.onerror = (err) => {
      console.log("❌ WS Error", err);
    };

    ws.onclose = () => {
      console.log("🔌 WS Closed");
    };

    return () => ws.close();

  }, []); // ✅ ONLY ONCE


  // 🔥 Dynamic progress (fallback to backend progress if no route)
  const progress = useMemo(() => {
    if (!booking?.route || booking.route.length === 0) {
      return booking?.progress ?? 0;
    }

    const total = booking.route.length;
    const covered = coveredPath.length;

    return Math.min((covered / total) * 100, 100);
  }, [coveredPath, booking]);

  return (
    <div className="tracking-page" style={{ background: t.bg }}>
      <div className="tracking-wrapper">

        {/* Header */}
        <div className="tracking-header">
          <button
            className="tracking-back-btn"
            onClick={() => setPage("dashboard")}
            style={{ border: `1px solid ${t.border}`, color: t.text }}
          >
            ← Back
          </button>

          <h2 className="tracking-title" style={{ color: t.text }}>
            Live Tracking
          </h2>

          <span className="tracking-id" style={{ color: t.accent }}>
            {booking?.bookingId || booking?.id}
          </span>
        </div>

        {/* 🔥 MAP (updated with live data) */}
        <div className="tracking-main">

          {/* LEFT SIDE → MAP */}
          <div className="tracking-left">
            <div className="card map-card">
              <TrackingMap
                t={t}
                booking={booking}
                vehiclePos={vehiclePos}
                coveredPath={coveredPath}
              />
            </div>
          </div>

          {/* RIGHT SIDE → PROGRESS + MILESTONES */}
          <div className="tracking-right">

            {/* Progress */}
            <div
              className="card"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="progress-header">
                <span style={{ color: t.textMuted, fontSize: 13 }}>
                  Journey Progress
                </span>
                <span style={{ fontWeight: 700, fontSize: 22, color: t.text }}>
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="progress-bar-bg" style={{ background: t.surfaceAlt }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${t.accent}, ${t.accent})`,
                  }}
                />
              </div>
            </div>

            {/* Milestones */}
            <div
              className="card"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="milestone-title">Route Milestones</div>

              {["Picked", "In Transit", "Delivered"].map((step, i) => {
                const done = i < Math.floor(progress / 33);
                const active = i === Math.floor(progress / 33);

                return (
                  <div key={step} className="milestone-item">
                    <div
                      className="milestone-circle"
                      style={{
                        background: done
                          ? t.success
                          : active
                          ? t.accent
                          : t.surfaceAlt,
                        color: "#fff",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>

                    <div>
                      <div className="milestone-text">{step}</div>
                      {active && <div className="milestone-active">● In progress</div>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}