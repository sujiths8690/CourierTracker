import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../redux/features/booking/bookingActions";
import { selectBookings, selectBookingLoading } from "../redux/features/booking/bookingSelector";


export default function BookingSection({
  customers = [],
  vehicles = [],
  openModal,
  setTrackingBooking,
  setPage,
  t
}) { 
  const statusColor = (s) => {
    const l = s?.toLowerCase() || "";
    if (l.includes("delivered")) return { bg: t.successBg, color: t.success };
    if (l.includes("transit")) return { bg: t.warningBg, color: t.warning };
    return { bg: t.surfaceAlt, color: t.textMuted };
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

  useEffect(()=>{
    dispatch(fetchBookings());
  }, [dispatch]);

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

      {/* Cards */}
      {bookings.map((b) => {
        const sc = statusColor(b.status);
        const customer = customers?.find(
          (c) => c.id === Number(b.customerId)
        );

        const vehicle = vehicles?.find(
          (v) => v.id === Number(b.vehicleId)
        );

        return (
          <div key={b.id} className="booking-card">
            {/* Top */}
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
                  Track
                </button>
              </div>
            </div>

            {/* Info */}
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

            {/* Progress */}
            <div className="progress-section">
              <div className="progress-header">
                <span>Progress</span>
                <span>{b.progress}%</span>
              </div>

              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${b.progress}%` }}
                />
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Created: {formatDateTime(b.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}