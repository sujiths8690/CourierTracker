// ─── StatsRow.jsx ─────────────────────────────────────────────────────────────
// Summary metric cards displayed in a responsive grid at the top of
// the driver dashboard.
//
// Props:
//   deliveries  array    – vehicle delivery records used to compute counts

export default function StatsRow({ deliveries }) {
  const completed    = deliveries.filter((d) => d.status === "delivered").length;
  const totalEarning = deliveries
    .filter((d) => d.status === "delivered")
    .reduce((s, d) => s + (d.earnings || 0), 0);

  const cards = [
    {
      label: "Total Trips",
      value: completed,
      sub:   "completed for this vehicle",
      color: "var(--dp-accent)",
    },
    {
      label: "Completed",
      value: completed,
      sub:   "delivered",
      color: "var(--dp-success)",
    },
    {
      label: "Earnings",
      value: `₹${(totalEarning / 1000).toFixed(1)}k`,
      sub:   "completed trips",
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
