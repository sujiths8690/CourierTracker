import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/features/dashboard/dashboardActions";

export default function Dashboard({ setTrackingBooking, setPage, t }) {
  const dispatch = useDispatch();
  const dashboardDetails = useSelector((state) => state.dashboard.data);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // 🎨 STATUS COLOR
  const statusColor = (s) => {
    const l = s?.toLowerCase() || "";
    if (l.includes("completed") || l.includes("delivered"))
      return { bg: t.successBg, color: t.success };

    if (l.includes("ongoing") || l.includes("transit"))
      return { bg: t.warningBg, color: t.warning };

    return { bg: t.surfaceAlt, color: t.textMuted };
  };
  

  // 📊 ANALYTICS
  const analyticsCards = [
    { label: "Total Orders", value: dashboardDetails?.totalOrders, color: t.info },
    { label: "In Transit", value: dashboardDetails?.inTransit, color: t.warning },
    { label: "Delivered", value: dashboardDetails?.delivered, color: t.success },
    { label: "Customers", value: dashboardDetails?.customers, color: t.accent },
  ];

  // 📍 SMART ADDRESS SHORTENER (better than split)
  const formatAddress = (address) => {
    if (!address) return "";

    const parts = address.split(",").map((p) => p.trim());

    const filtered = parts.filter(
      (p) => !/^\d+$/.test(p) && p.toLowerCase() !== "india"
    );

    if (filtered.length >= 2) {
      return `${filtered[0]}, ${filtered[filtered.length - 2]}`;
    }

    return filtered[0];
  };

  return (
    <div>
      {/* ================= ANALYTICS ================= */}
      <div className="analytics-grid">
        {analyticsCards.map(({ label, value, color }) => (
          <div
            key={label}
            className="analytics-card"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
            }}
          >
            <div
              className="analytics-label"
              style={{ color: t.textMuted }}
            >
              {label}
            </div>

            <div
              className="analytics-value"
              style={{ color }}
            >
              {value ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* ================= RECENT BOOKINGS ================= */}
      <div
        className="recent-bookings-card"
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
        }}
      >
        <h3
          className="section-title"
          style={{ color: t.text }}
        >
          Recent Bookings
        </h3>

        {dashboardDetails?.recentBookings?.length === 0 && (
          <p style={{ color: t.textMuted }}>
            No recent bookings
          </p>
        )}

        {dashboardDetails?.recentBookings?.map((b) => {
          const sc = statusColor(b.status);

          return (
            <div
              key={b.id}
              className="booking-row"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              {/* BOOKING ID */}
              <div
                className="booking-id"
                style={{ color: t.accent }}
              >
                {b.bookingId}
              </div>

              {/* ADDRESS */}
              <div
                className="dest-address"
                style={{ color: t.text }}
              >
                {formatAddress(b.destAddress)}
              </div>

              {/* STATUS */}
              <div
                className="status-badge"
                style={{
                  background: sc.bg,
                  color: sc.color,
                }}
              >
                {b.status}
              </div>

              {/* PROGRESS */}
              <div
                className="progress-bar-container"
                style={{ background: t.surfaceAlt }}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${b.progress ?? 10}%`,
                    background: t.accent,
                  }}
                />
              </div>

              {/* TRACK BUTTON */}
              <button
                onClick={() => {
                  console.log("TRACK CLICKED:", b);

                  // ⚠️ IMPORTANT FIX → pass ID
                  setTrackingBooking(b.id);
                  setPage("tracking");
                }}
                className="track-button"
                style={{ background: t.accent }}
              >
                Track
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= BOTTOM GRID ================= */}
      <div className="bottom-grid">
        {/* ACTIVE VEHICLES */}
        <div
          className="sub-card"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <h3
            className="sub-title"
            style={{ color: t.text }}
          >
            Active Vehicles
          </h3>

          {dashboardDetails?.activeVehicles?.map((v) => (
            <div
              key={v.id}
              className="vehicle-row"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <span style={{ fontWeight: 500 }}>
                {v.number}
              </span>

              <span
                style={{
                  color: t.warning,
                  fontWeight: 500,
                }}
              >
                {v.status}
              </span>
            </div>
          ))}
        </div>

        {/* RECENT CUSTOMERS */}
        <div
          className="sub-card"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <h3
            className="sub-title"
            style={{ color: t.text }}
          >
            Recent Customers
          </h3>

          {dashboardDetails?.recentCustomers?.map((c) => (
            <div
              key={c.id}
              className="customer-row"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <div
                className="customer-avatar"
                style={{
                  background: t.accentLight,
                  color: t.accent,
                }}
              >
                {c.name[0]}
              </div>

              <div>
                <div style={{ fontWeight: 500 }}>
                  {c.name}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: t.textMuted,
                  }}
                >
                  {c.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}