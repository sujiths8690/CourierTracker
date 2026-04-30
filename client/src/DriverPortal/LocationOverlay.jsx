// ─── LocationOverlay.jsx ──────────────────────────────────────────────────────
// Full-screen modal that collects the driver's GPS coordinates before
// confirming a trip acceptance. Falls back to mock coords if GPS is denied.
//
// Props:
//   request    object   – the trip request being accepted
//   onConfirm  fn(request, { lat, lng }) – called when driver confirms
//   onCancel   fn       – called when driver cancels

import { useState, useEffect } from "react";
import { Icon } from "./Helpers";

export default function LocationOverlay({ request, onConfirm, onCancel }) {
  const [coords,  setCoords]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 9.9312, lng: 76.2673 });
      setWarning("GPS not available — using approximate location.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setCoords({ lat: 9.9312, lng: 76.2673 });
        setWarning("GPS access denied — using approximate location.");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return (
    <div className="dp-location-overlay">
      <div className="dp-location-card">

        {/* Icon */}
        <div className="dp-location-icon">
          {Icon.location("var(--dp-success)")}
        </div>

        {/* Heading */}
        <h3 className="dp-location-title">Share your location</h3>
        <p className="dp-location-desc">
          To accept <strong>{request.id}</strong>, we need your current
          location so the customer can track you in real time on the map.
        </p>

        {/* Coords display */}
        <div className="dp-location-coords">
          {loading ? (
            <>
              <svg
                style={{ animation: "dp-spin 1s linear infinite", verticalAlign: "middle" }}
                width="14" height="14" viewBox="0 0 14 14" fill="none"
              >
                <circle cx="7" cy="7" r="5.5" stroke="var(--dp-text-muted)" strokeWidth="1.5" />
                <path d="M7 1.5a5.5 5.5 0 015.5 5.5"
                  stroke="var(--dp-success)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {" "}Acquiring location…
            </>
          ) : (
            <>
              {warning && (
                <div style={{
                  fontSize: 12, color: "var(--dp-warning)",
                  marginBottom: 6, lineHeight: 1.4,
                }}>
                  {warning}
                </div>
              )}
              <strong>{coords.lat.toFixed(5)}°N</strong>,{" "}
              <strong>{coords.lng.toFixed(5)}°E</strong>
            </>
          )}
        </div>

        {/* Confirm */}
        <button
          className="dp-btn-location"
          disabled={loading}
          onClick={() => coords && onConfirm(request, coords)}
        >
          {Icon.check}
          Confirm &amp; Accept Trip
        </button>

        {/* Cancel */}
        <button className="dp-btn-location-cancel" onClick={onCancel}>
          Cancel
        </button>

      </div>
    </div>
  );
}