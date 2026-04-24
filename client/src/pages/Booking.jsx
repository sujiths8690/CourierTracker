// components/BookingSection.jsx

export default function BookingSection({
  bookings,
  customers,
  vehicles,
  openModal,
  setTrackingBooking,
  setPage,
  t
}) {

  // 🎨 Status styling (clean + consistent)
  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "";

    if (s === "completed") {
      return { label: "Delivered", bg: t.successBg, color: t.success };
    }

    if (s === "ongoing") {
      return { label: "In Transit", bg: t.warningBg, color: t.warning };
    }

    if (s === "pending") {
      return { label: "Assigned", bg: t.infoBg, color: t.info };
    }

    return { label: status, bg: t.surfaceAlt, color: t.textMuted };
  };

  return (
    <div className="booking-section">

      {/* 🔹 HEADER */}
      <div className="booking-header">
        <div>
          <h2 style={{ color: t.text }}>Bookings</h2>
          <p className="booking-count" style={{ color: t.textMuted }}>
            {bookings.length} active deliveries
          </p>
        </div>

        <button
          onClick={() => setPage("booking-create")}
          className="create-booking-btn"
          style={{ background: t.accent }}
        >
          + New Booking
        </button>
      </div>

      {/* 🔹 EMPTY STATE */}
      {bookings.length === 0 && (
        <div className="empty-state" style={{ color: t.textMuted }}>
          No bookings yet 🚚
        </div>
      )}

      {/* 🔹 LIST */}
      <div className="booking-list">
        {bookings.map((b) => {

          const customer = customers.find(c => c.id === Number(b.customerId));
          const vehicle = vehicles.find(v => v.id === Number(b.vehicleId));
          const sc = getStatusConfig(b.status);

          return (
            <div
              key={b.id}
              className="booking-card"
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`
              }}
            >

              {/* 🔸 TOP */}
              <div className="booking-top">

                <div>
                  <div className="booking-id" style={{ color: t.accent }}>
                    #{b.bookingId || b.id}
                  </div>

                  <div className="pickup-text" style={{ color: t.textMuted }}>
                    📍 {b.pickupAddress}
                  </div>
                </div>

                <div className="booking-actions">

                  <span
                    className="status-badge"
                    style={{
                      background: sc.bg,
                      color: sc.color
                    }}
                  >
                    {sc.label}
                  </span>

                  <button
                    className="track-btn"
                    style={{ background: t.accent }}
                    onClick={() => {
                      setTrackingBooking(b);
                      setPage("tracking");
                    }}
                  >
                    Track
                  </button>

                </div>
              </div>

              {/* 🔸 INFO GRID */}
              <div className="booking-info">

                <div className="info-item">
                  <div className="label" style={{ color: t.textMuted }}>
                    Customer
                  </div>
                  <div style={{ color: t.text }}>
                    {customer?.name || `#${b.customerId}`}
                  </div>
                </div>

                <div className="info-item">
                  <div className="label" style={{ color: t.textMuted }}>
                    Vehicle
                  </div>
                  <div style={{ color: t.text }}>
                    {vehicle?.number || `#${b.vehicleId}`}
                  </div>
                </div>

              </div>

              {/* 🔸 PROGRESS */}
              <div className="progress-block">

                <div className="progress-top">
                  <span style={{ color: t.textMuted }}>
                    Progress
                  </span>
                  <span style={{ color: t.text }}>
                    {Math.round(b.progress || 0)}%
                  </span>
                </div>

                <div
                  className="progress-bg"
                  style={{ background: t.surfaceAlt }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width: `${b.progress || 0}%`,
                      background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover || t.accent})`
                    }}
                  />
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}