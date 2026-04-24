import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TruckMap from "../components/TruckMap";
import { fetchBookingById } from "../redux/features/booking/bookingActions";
import { selectSelectedBooking } from "../redux/features/booking/bookingSelector";

export default function TrackingPage({ bookingId, setPage, t }) {
  const dispatch = useDispatch();
  const booking = useSelector(selectSelectedBooking);

  // 🔥 FETCH BOOKING
  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [bookingId, dispatch]);

  // 🎨 STATUS → PROGRESS (fallback if backend not sending progress)
  const getProgress = (status) => {
    switch (status) {
      case "PENDING":
        return 10;
      case "ONGOING":
        return 60;
      case "COMPLETED":
        return 100;
      default:
        return 0;
    }
  };

  const progress = booking?.progress ?? getProgress(booking?.status);

  return (
    <div
      className="tracking-page"
      style={{ background: t.bg }}
    >
      <div className="tracking-wrapper">

        {/* ================= HEADER ================= */}
        <div className="tracking-header">
          <button
            className="tracking-back-btn"
            onClick={() => setPage("app")}
            style={{
              border: `1px solid ${t.border}`,
              color: t.text
            }}
          >
            ← Back
          </button>

          <h2
            className="tracking-title"
            style={{ color: t.text }}
          >
            Live Tracking
          </h2>

          <span
            className="tracking-id"
            style={{ color: t.accent }}
          >
            {booking?.bookingId || booking?.id}
          </span>
        </div>

        {/* ================= MAP ================= */}
        <TruckMap t={t} booking={booking} />

        {/* ================= PROGRESS ================= */}
        <div
          className="card"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`
          }}
        >
          <div className="progress-header">
            <span style={{ color: t.textMuted }}>
              Journey Progress
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: 22,
                color: t.text
              }}
            >
              {progress}%
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

          {/* 🔥 REAL INFO */}
          <div className="info-grid">
            <div className="info-box" style={{ background: t.surfaceAlt }}>
              <div style={{ color: t.textMuted }}>Status</div>
              <div style={{ color: t.text }}>{booking?.status}</div>
            </div>

            <div className="info-box" style={{ background: t.surfaceAlt }}>
              <div style={{ color: t.textMuted }}>Last Update</div>
              <div style={{ color: t.text }}>
                {booking?.lastUpdated
                  ? new Date(booking.lastUpdated).toLocaleTimeString()
                  : "--"}
              </div>
            </div>

            <div className="info-box" style={{ background: t.surfaceAlt }}>
              <div style={{ color: t.textMuted }}>Vehicle</div>
              <div style={{ color: t.text }}>
                {booking?.vehicle?.number || "--"}
              </div>
            </div>
          </div>
        </div>

        {/* ================= MILESTONES ================= */}
        <div
          className="card"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`
          }}
        >
          <div
            className="milestone-title"
            style={{ color: t.textMuted }}
          >
            Route Milestones
          </div>

          {[
            "Pickup",
            "In Transit",
            "Near Destination",
            "Delivered",
          ].map((step, i) => {
            const done = progress >= (i + 1) * 25;
            const active =
              progress >= i * 25 && progress < (i + 1) * 25;

            return (
              <div
                key={step}
                className="milestone-item"
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
                    style={{
                      color: done || active ? t.text : t.textMuted,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step}
                  </div>

                  {active && (
                    <div style={{ color: t.accent }}>
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