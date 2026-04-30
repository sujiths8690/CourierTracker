// ─── TripRequestCard.jsx ─────────────────────────────────────────────────────
// Renders one incoming trip request with distance breakdown, route visual,
// estimated earnings, and Accept / Decline action buttons.
//
// Props:
//   request     object   – trip request data (see mockData.js for shape)
//   onAccept    fn(req)  – called when driver taps Accept
//   onReject    fn(id)   – called when driver taps Decline

import { Icon } from "./Helpers";

export default function TripRequestCard({ request: req, onAccept, onReject }) {
  return (
    <div className={`dp-request-card ${req.isNew ? "is-new" : ""}`}>

      {/* Top accent colour strip */}
      <div className="dp-request-strip" />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="dp-request-header">
        <div>
          <div className="dp-request-id">{req.id}</div>
          <p className="dp-request-customer">{req.customer}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <span style={{ color: "var(--dp-text-muted)", fontSize: 12 }}>{Icon.phone}</span>
            <span style={{ fontSize: 12, color: "var(--dp-text-muted)" }}>{req.phone}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="dp-request-time">{req.requestedAt}</div>
          {req.isNew && (
            <span className="dp-pill accepted" style={{ marginTop: 4, display: "inline-block" }}>
              New
            </span>
          )}
        </div>
      </div>

      {/* ── Distance breakdown ───────────────────────────────────── */}
      <div className="dp-dist-row">
        <div className="dp-dist-cell">
          <div className="dp-dist-label">To Pickup</div>
          <div className="dp-dist-value">
            {req.distToPickup.toFixed(1)}
            <span className="dp-dist-unit"> km</span>
          </div>
        </div>
        <div className="dp-dist-cell">
          <div className="dp-dist-label">Delivery</div>
          <div className="dp-dist-value">
            {req.pickupToDest.toFixed(1)}
            <span className="dp-dist-unit"> km</span>
          </div>
        </div>
        <div className="dp-dist-cell is-total">
          <div className="dp-dist-label">Total</div>
          <div className="dp-dist-value">
            {req.totalKm.toFixed(1)}
            <span className="dp-dist-unit"> km</span>
          </div>
        </div>
      </div>

      {/* ── Route visualisation ──────────────────────────────────── */}
      <div className="dp-route-line">

        {/* Driver's current location */}
        <div className="dp-route-point">
          <div className="dp-route-dot-wrap">
            <div className="dp-route-dot origin" />
            <div className="dp-route-connector" />
          </div>
          <div>
            <div className="dp-route-label">Your location</div>
            <div className="dp-route-addr">
              {req.driverLat.toFixed(4)}°N, {req.driverLng.toFixed(4)}°E
            </div>
          </div>
        </div>

        {/* Pickup point */}
        <div className="dp-route-point">
          <div className="dp-route-dot-wrap">
            <div className="dp-route-dot pickup" />
            <div className="dp-route-connector" />
          </div>
          <div>
            <div className="dp-route-label">
              Pickup · {req.distToPickup.toFixed(1)} km away
            </div>
            <div className="dp-route-addr">{req.pickupAddress}</div>
          </div>
        </div>

        {/* Destination */}
        <div className="dp-route-point">
          <div className="dp-route-dot-wrap">
            <div className="dp-route-dot destination" />
          </div>
          <div>
            <div className="dp-route-label">
              Destination · {req.pickupToDest.toFixed(1)} km from pickup
            </div>
            <div className="dp-route-addr">{req.destinationAddress}</div>
          </div>
        </div>

      </div>

      {/* ── Estimated earnings ───────────────────────────────────── */}
      <div className="dp-earnings-row">
        <span className="dp-earnings-label">Estimated earnings</span>
        <span className="dp-earnings-value">₹{req.estimatedEarnings.toLocaleString()}</span>
      </div>

      {/* ── Accept / Decline ─────────────────────────────────────── */}
      <div className="dp-action-row">
        <button className="dp-btn-accept" onClick={() => onAccept(req)}>
          {Icon.check}
          Accept
        </button>
        <button className="dp-btn-reject" onClick={() => onReject(req.id)}>
          {Icon.x}
          Decline
        </button>
      </div>

    </div>
  );
}