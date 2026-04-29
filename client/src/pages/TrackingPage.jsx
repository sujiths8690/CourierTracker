import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById } from "../redux/features/booking/bookingActions";
import { selectSelectedBooking } from "../redux/features/booking/bookingSelector";
import { useEffect, useState, useMemo } from "react";
import TrackingMap from "../components/TrackingMap";
import { fetchTrackingLogs } from "../redux/features/tracking/trackingActions";
import L from "leaflet";
import truckIconImg from "../assets/truck.png";
import pickupIconImg from "../assets/pickup.png";



export default function TrackingPage({ bookingId, setPage, t }) {
  const dispatch = useDispatch();
  const booking = useSelector(selectSelectedBooking);

  const [vehiclePos, setVehiclePos] = useState(null);
  const [coveredPath, setCoveredPath] = useState([]);

  console.log("BOOKING ID:", bookingId);

  const logs = useSelector(state => state.tracking.logs);

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

  useEffect(() => {
  if (!logs || logs.length === 0) return;

  const path = logs.map(l => [l.lat, l.lng]);

  setCoveredPath(path);

  if (path.length > 0) {
    setVehiclePos(path[path.length - 1]); // last position
  }
}, [logs]);

  useEffect(() => {
    if (!booking) return;

    // priority 1: last known vehicle position
    if (booking.lastLat && booking.lastLng) {
      setVehiclePos([booking.lastLat, booking.lastLng]);
      return;
    }

    // fallback: pickup location
    if (booking.pickupLat && booking.pickupLng) {
      setVehiclePos([booking.pickupLat, booking.pickupLng]);
    }
  }, [booking]);

  // 🔥 Initialize vehicle position from booking
  useEffect(() => {
    if (!bookingId) return;

    const ws = new WebSocket("ws://192.168.1.84:3003");

    ws.onopen = () => {
      console.log("✅ WS Connected");

      // 🔵 booking tracking
      ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        bookingId: bookingId
      }));

      // 🔵 vehicle map tracking (IMPORTANT)
      ws.send(JSON.stringify({
        type: "SUBSCRIBE_MAP"
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "VEHICLE_LOCATION") {
        if (booking?.vehicleId === data.vehicleId) {
          const newPos = [data.lat, data.lng];

          console.log("WS POS:", data.lat, data.lng);

          setVehiclePos(newPos);

          // 🔥 THIS LINE CREATES GREEN PATH
          setCoveredPath(prev => [...prev, newPos]);
        }
      }

      if (data.type === "TRIP_COMPLETED") {
        console.log("Trip completed");
      }
    };

    ws.onerror = (err) => {
      console.log("❌ WS Error", err);
    };

    ws.onclose = () => {
      console.log("🔌 WS Closed");
    };

    // ❗ IMPORTANT: only close on unmount
    return () => {
      ws.close();
    };

  }, [bookingId, booking?.vehicleId]); // 🔥 ONLY RUN ONCE


  // 🔥 Dynamic progress (fallback to backend progress if no route)
  const progress = useMemo(() => {
    if (!booking?.route || booking.route.length === 0) {
      return booking?.progress ?? 0;
    }

    const total = booking.route.length;
    const covered = coveredPath.length;

    return Math.min((covered / total) * 100, 100);
  }, [coveredPath, booking]);

  const timeline = useMemo(() => {
    if (!booking) return {};

    const pickupTime =
      booking.status === "LOADING" ||
      booking.status === "ONGOING" ||
      booking.status === "COMPLETED"
        ? booking.updatedAt
        : null;

    const departTime =
      booking.status === "ONGOING" ||
      booking.status === "COMPLETED"
        ? booking.updatedAt
        : null;

    const delivered =
      booking.status === "COMPLETED";

    const deliveredAt = delivered ? booking.updatedAt : null;

    // ETA fallback
    const etaTime = new Date();
    etaTime.setMinutes(etaTime.getMinutes() + 30);

    return {
      pickupTime,
      departTime,
      eta: etaTime,
      delivered,
      deliveredAt
    };
  }, [booking]);

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
        <TrackingMap
          t={t}
          booking={booking}
          vehiclePos={vehiclePos}
          coveredPath={coveredPath}
        />

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

          <div
            className="progress-bar-bg"
            style={{ background: t.surfaceAlt }}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover || t.accent})`,
              }}
            />
          </div>

          <div className="info-grid">
            {[
              {
                label: "Reached Pickup",
                value: timeline.pickupTime
                  ? new Date(timeline.pickupTime).toLocaleTimeString()
                  : "Waiting..."
              },
              {
                label: "Departed",
                value: timeline.departTime
                  ? new Date(timeline.departTime).toLocaleTimeString()
                  : "Not yet"
              },
              {
                label: "ETA",
                value: timeline.delivered
                  ? "Delivered"
                  : timeline.eta?.toLocaleTimeString()
              }
            ].map(({ label, value }) => (
              <div
                key={label}
                className="info-box"
                style={{
                  background: timeline.delivered && label === "ETA"
                    ? "#22c55e"
                    : t.surfaceAlt,
                  color: timeline.delivered && label === "ETA"
                    ? "#fff"
                    : t.text
                }}
              >
                <div className="info-label" style={{ color: t.textMuted }}>
                  {label}
                </div>
                <div
                  className="info-value"
                  style={{ color: t.text }}
                  title={
                    label === "Reached Pickup" && timeline.pickupTime
                      ? new Date(timeline.pickupTime).toLocaleString()
                      : label === "Departed" && timeline.departTime
                      ? new Date(timeline.departTime).toLocaleString()
                      : ""
                  }
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div
          className="card"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div className="milestone-title" style={{ color: t.textMuted }}>
            Route Milestones
          </div>

          {[
            "Package picked up",
            "Out for delivery",
            "Delivered",
          ].map((step, i) => {
            const done = i < Math.floor(progress / 33);
            const active = i === Math.floor(progress / 33);

            return (
              <div
                key={step}
                className={`milestone-item ${i < 3 ? "border-bottom" : ""}`}
                style={{ borderColor: t.border }}
              >
                <div
                  className="milestone-circle"
                  style={{
                    background: done
                      ? t.success
                      : active
                      ? t.accent
                      : t.surfaceAlt,
                    color: done || active ? "#fff" : t.textMuted,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>

                <div>
                  <div
                    className="milestone-text"
                    style={{
                      color: done || active ? t.text : t.textMuted,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step}
                  </div>

                  {active && (
                    <div
                      className="milestone-active"
                      style={{ color: t.accent }}
                    >
                      ● In progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
