// ─── TripRequestsTab.jsx ─────────────────────────────────────────────────────
// Renders the "Trip Requests" tab content — a responsive card grid of all
// pending incoming requests, with an empty state when none are left.
//
// Props:
//   requests   array    – list of pending trip request objects
//   onAccept   fn(req)  – called when driver taps Accept on a card
//   onReject   fn(id)   – called when driver taps Decline on a card

import TripRequestCard from "./TripRequestCard";
import { Icon } from "./Helpers";

export default function TripRequestsTab({ requests, onAccept, onReject }) {
  return (
    <>
      <h2 className="dp-section-title">
        Incoming Trip Requests
        {requests.length > 0 && ` (${requests.length})`}
      </h2>

      <div className="dp-requests-grid">
        {requests.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-icon">
              {Icon.truck("var(--dp-text-muted)")}
            </div>
            <p className="dp-empty-text">No pending trip requests right now.</p>
            <p style={{ fontSize: 13, color: "var(--dp-text-muted)", margin: 0 }}>
              New requests will appear here automatically.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <TripRequestCard
              key={req.id}
              request={req}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))
        )}
      </div>
    </>
  );
}