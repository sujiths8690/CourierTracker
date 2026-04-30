// ─── DeliveryHistoryTab.jsx ───────────────────────────────────────────────────
// Renders the "Delivery History" tab — a full-width scrollable table of all
// past and active deliveries, followed by an earnings summary footer strip.
//
// Props:
//   deliveries  array   – list of delivery objects
//   driver      object  – driver info (used for rating display)

import { pillClass, initials, Icon } from "./Helpers";

// ─── Progress bar cell ────────────────────────────────────────────────────────
function ProgressCell({ progress }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="dp-progress-wrap">
        <div
          className="dp-progress-bar"
          style={{ "--bar-width": `${progress}%`, width: `${progress}%` }}
        />
      </div>
      <span style={{ fontSize: 12, color: "var(--dp-text-muted)", minWidth: 30 }}>
        {progress}%
      </span>
    </div>
  );
}

// ─── Customer cell with avatar ────────────────────────────────────────────────
function CustomerCell({ name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "var(--dp-accent-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "var(--dp-accent)",
        flexShrink: 0,
      }}>
        {name[0]}
      </div>
      {name}
    </div>
  );
}

// ─── Earnings / totals summary strip ─────────────────────────────────────────
function EarningsSummary({ deliveries, driver }) {
  const totalDist     = deliveries.reduce((s, d) => s + d.distance, 0);
  const totalEarnings = deliveries.reduce((s, d) => s + d.earnings, 0);

  const items = [
    {
      label: "Total distance",
      value: `${totalDist.toFixed(1)} km`,
      color: "var(--dp-info)",
      bg:    "var(--dp-info-bg)",
    },
    {
      label: "Total earnings",
      value: `₹${totalEarnings.toLocaleString()}`,
      color: "var(--dp-success)",
      bg:    "var(--dp-success-bg)",
    },
    {
      label: "Driver rating",
      value: `★ ${driver.rating}`,
      color: "var(--dp-warning)",
      bg:    "var(--dp-warning-bg)",
    },
  ];

  return (
    <div style={{ marginTop: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
      {items.map(({ label, value, color, bg }) => (
        <div
          key={label}
          style={{
            flex: 1, minWidth: 180,
            background: bg, borderRadius: 12, padding: "14px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color, fontWeight: 500 }}>{label}</span>
          <span style={{
            fontSize: 18, fontWeight: 700, color,
            fontFamily: "'Playfair Display', serif",
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function DeliveryHistoryTab({ deliveries, driver }) {
  if (deliveries.length === 0) {
    return (
      <>
        <h2 className="dp-section-title">Delivery History</h2>
        <div className="dp-empty">
          <div className="dp-empty-icon">{Icon.history}</div>
          <p className="dp-empty-text">No deliveries yet.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="dp-section-title">Delivery History</h2>

      {/* Scrollable table wrapper */}
      <div style={{ overflowX: "auto" }}>
        <table className="dp-deliveries-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Distance</th>
              <th>Earnings</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>

                <td>
                  <span style={{ fontWeight: 700, color: "var(--dp-accent)", fontSize: 13 }}>
                    {d.id}
                  </span>
                </td>

                <td><CustomerCell name={d.customer} /></td>

                <td style={{
                  maxWidth: 160, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {d.pickup}
                </td>

                <td style={{
                  maxWidth: 160, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {d.destination}
                </td>

                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {d.distance.toFixed(1)} km
                </td>

                <td style={{ fontWeight: 700, color: "var(--dp-success)", whiteSpace: "nowrap" }}>
                  ₹{d.earnings.toLocaleString()}
                </td>

                <td>
                  <span className={`dp-pill ${pillClass(d.status)}`}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </td>

                <td><ProgressCell progress={d.progress} /></td>

                <td style={{ whiteSpace: "nowrap", color: "var(--dp-text-muted)", fontSize: 12 }}>
                  {d.date}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EarningsSummary deliveries={deliveries} driver={driver} />
    </>
  );
}