import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../../redux/features/booking/bookingActions";
import { selectBookings } from "../../redux/features/booking/bookingSelector";
import { getBookingProgress } from "../../utils/bookingProgress";


export default function BookingSection({
  setTrackingBooking,
  setPage,
  t
}) { 
  const [activeTab, setActiveTab] = useState("live");

  const statusColor = (s) => {
    const l = s?.toLowerCase() || "";
    if (l.includes("completed") || l.includes("delivered")) return { bg: t.successBg, color: t.success };
    if (l.includes("ongoing") || l.includes("transit")) return { bg: t.warningBg, color: t.warning };
    if (l.includes("loading")) return { bg: t.infoBg, color: t.info };
    if (l.includes("cancelled")) return { bg: t.dangerBg, color: t.danger };
    return { bg: t.surfaceAlt, color: t.textMuted };
  };

  const isCompletedBooking = (booking) => {
    const status = (booking.status || "").toLowerCase();
    return status.includes("completed") || status.includes("delivered");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const dispatch= useDispatch();

  const bookings= useSelector(selectBookings);

  const liveBookings = useMemo(
    () => bookings.filter((booking) => !isCompletedBooking(booking)),
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter(isCompletedBooking),
    [bookings]
  );

  const visibleBookings = activeTab === "live" ? liveBookings : completedBookings;
  const emptyMessage =
    activeTab === "live"
      ? "No live orders right now"
      : "No completed orders yet";
  const actionLabel = activeTab === "live" ? "Track" : "View";

  useEffect(()=>{
    dispatch(fetchBookings());

    const interval = setInterval(() => {
      dispatch(fetchBookings());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const renderBookingCard = (b, actionLabel = "Track") => {
    const sc = statusColor(b.status);
    const progress = getBookingProgress(b);

    return (
      <div key={b.id} className="booking-card">
        <div className="booking-top">
          <div>
            <div className="booking-id">{b.bookingId}</div>
            <div className="booking-address">
              Pickup: {b.pickupAddress}
            </div>
          </div>

          <div className="booking-actions">
            <span
              className="status-badge"
              style={{
                background: sc.bg,
                color: sc.color,
              }}
            >
              {b.status}
            </span>

            <button
              className="btn-track"
              onClick={() => {
                setTrackingBooking(b.id);
                setPage("tracking");
              }}
            >
              {actionLabel}
            </button>
          </div>
        </div>

        <div className="booking-grid">
          <div className="booking-box">
            <div className="booking-label">Customer</div>
            <div style={{ color: "var(--text)" }}>
              {b.Customer?.name || "Unknown"}
            </div>
          </div>

          <div className="booking-box">
            <div className="booking-label">Vehicle</div>
            <div style={{ color: "var(--text)" }}>
              {b.VehicleDetails?.number || "Unknown"}
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
          Created: {formatDateTime(b.createdAt)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="booking-root"
      style={{
        "--surface": t.surface,
        "--surface-alt": t.surfaceAlt,
        "--border": t.border,
        "--text": t.text,
        "--text-muted": t.textMuted,
        "--accent": t.accent
      }}
    >
      {/* Header */}
      <div className="booking-header">
        <p className="booking-count">
          {bookings.length} bookings total
        </p>

        <button
          className="btn-primary"
          onClick={() => setPage("booking-create")}
        >
          + Create Booking
        </button>
      </div>

      <div className="booking-filter-tabs">
        <button
          type="button"
          className={`booking-filter-btn ${activeTab === "live" ? "is-active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          Live Orders
          <span>{liveBookings.length}</span>
        </button>

        <button
          type="button"
          className={`booking-filter-btn ${activeTab === "completed" ? "is-active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed Orders
          <span>{completedBookings.length}</span>
        </button>
      </div>

      <div className="booking-list">
        {visibleBookings.length === 0 && (
          <div className="booking-empty">{emptyMessage}</div>
        )}

        {visibleBookings.map((b) => renderBookingCard(b, actionLabel))}
      </div>
    </div>
  );
}
