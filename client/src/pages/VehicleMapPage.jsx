import MapSection from "../components/MapSection";

export default function VehicleMapPage({ vehicle, setPage, t }) {
  
  const hasLocation =
    vehicle?.lastLat !== null && vehicle?.lastLng !== null;

  const position = hasLocation
    ? [vehicle.lastLat, vehicle.lastLng]
    : [10, 76]; // fallback

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        padding: 20
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <button
          onClick={() => setPage("app")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: "transparent",
            color: t.text,
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

        <h3 style={{ color: t.text }}>
          Vehicle Location
        </h3>

        <div style={{ color: t.accent, fontWeight: 600 }}>
          {vehicle?.number}
        </div>
      </div>

      {/* INFO CARD */}
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          {vehicle?.number}
        </div>

        <div style={{ fontSize: 13, color: t.textMuted }}>
          {vehicle?.type} · {vehicle?.owner}
        </div>

        <div style={{ marginTop: 6, fontSize: 13 }}>
          💰 ₹{vehicle?.pricePerKm ?? "--"} / km
        </div>

        <div style={{ marginTop: 6, fontSize: 12, color: t.textMuted }}>
          {hasLocation
            ? "📍 Live location available"
            : "⚠️ Location not available"}
        </div>
      </div>

      {/* MAP */}
      <div
        style={{
          height: "500px",
          borderRadius: 12,
          overflow: "hidden"
        }}
      >
        <MapSection pos={position} />
      </div>
    </div>
  );
}