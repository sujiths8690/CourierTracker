// ─── StatsRow.jsx ─────────────────────────────────────────────────────────────
// Four summary metric cards displayed in a responsive grid at the top of
// the driver dashboard.
//
// Props:
//   driver      object   – driver data ({ totalTrips, rating })
//   deliveries  array    – all delivery records used to compute counts

export default function StatsRow({ driver, deliveries }) {
  const completed    = deliveries.filter((d) => d.status === "delivered").length;
  const active       = deliveries.filter((d) => d.status === "transit" || d.status === "accepted").length;
  const totalTrips   = driver.totalTrips + deliveries.filter((d) => d.status === "accepted").length;
  const totalEarning = deliveries.reduce((s, d) => s + (d.earnings || 0), 0);

  const cards = [
    {
      label: "Total Trips",
      value: totalTrips,
      sub:   "all time",
      color: "var(--dp-accent)",
    },
    {
      label: "Completed",
      value: completed,
      sub:   "delivered",
      color: "var(--dp-success)",
    },
    {
      label: "Active",
      value: active,
      sub:   "in progress",
      color: "var(--dp-warning)",
    },
    {
      label: "Earnings",
      value: `₹${(totalEarning / 1000).toFixed(1)}k`,
      sub:   "lifetime",
      color: "var(--dp-info)",
    },
  ];

  return (
    <div className="dp-stats-row">
      {cards.map(({ label, value, sub, color }) => (
        <div key={label} className="dp-stat-card">
          <div className="dp-stat-label">{label}</div>
          <div className="dp-stat-value" style={{ color }}>{value}</div>
          <div className="dp-stat-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}