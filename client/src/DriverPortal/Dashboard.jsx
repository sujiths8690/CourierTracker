// ─── Dashboard.jsx ────────────────────────────────────────────────────────────
// Main driver dashboard after login. Contains:
//   • Sticky Navbar
//   • Tab bar (Trip Requests | Delivery History)
//   • Stats row
//   • Tab content (TripRequestsTab or DeliveryHistoryTab)
//   • LocationOverlay (shown when accepting a trip)
//   • Toast notifications
//
// Props:
//   driver       object   – logged-in driver
//   onLogout     fn
//   darkMode     boolean
//   setDarkMode  fn

import { useState } from "react";
import { useThemeVars } from "./Hooks";
import { theme } from "./Theme";
import { MOCK_DELIVERIES, MOCK_REQUESTS } from "./MockData";
import { Icon } from "./Helpers";
import Navbar            from "./Navbar";
import StatsRow          from "./StatsRow";
import TripRequestsTab   from "./TripRequestsTab";
import DeliveryHistoryTab from "./DeliveryHistoryTab";
import LocationOverlay   from "./LocationOverlay";
import Toast             from "./Toast";

export default function Dashboard({ driver, onLogout, darkMode, setDarkMode }) {
  const [rootEl,      setRootEl]      = useState(null);
  const [activeTab,   setActiveTab]   = useState("requests");
  const [requests,    setRequests]    = useState(MOCK_REQUESTS);
  const [deliveries,  setDeliveries]  = useState(MOCK_DELIVERIES);
  const [locationFor, setLocationFor] = useState(null); // request awaiting location
  const [toast,       setToast]       = useState(null);

  const t = darkMode ? theme.dark : theme.light;
  useThemeVars(rootEl, t);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => setToast({ message, type });

  // Driver tapped Accept → open location overlay first
  const handleAccept = (req) => setLocationFor(req);

  // Location acquired → confirm acceptance, attach driver coords to record
  const handleConfirmAccept = (req, coords) => {
    setRequests((rs) => rs.filter((r) => r.id !== req.id));
    setDeliveries((ds) => [
      {
        id:         req.id,
        customer:   req.customer,
        pickup:     req.pickupAddress,
        destination: req.destinationAddress,
        distance:   req.pickupToDest,
        earnings:   req.estimatedEarnings,
        status:     "accepted",
        date:       "Today",
        progress:   0,
        // ↓ These coords feed your MapSection / tracking map
        driverLat:  coords.lat,
        driverLng:  coords.lng,
      },
      ...ds,
    ]);
    setLocationFor(null);
    setActiveTab("history");
    showToast(`Trip ${req.id} accepted — location shared ✓`, "success");
  };

  const handleReject = (id) => {
    setRequests((rs) => rs.filter((r) => r.id !== id));
    showToast("Trip request declined.", "danger");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dp-dash-root" ref={setRootEl}>

      {/* Location overlay (shown while accepting) */}
      {locationFor && (
        <LocationOverlay
          request={locationFor}
          onConfirm={handleConfirmAccept}
          onCancel={() => setLocationFor(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* Sticky nav */}
      <Navbar
        driver={driver}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={onLogout}
      />

      {/* Tab bar */}
      <div className="dp-tab-bar">
        <button
          className={`dp-tab ${activeTab === "requests" ? "is-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          {Icon.truck(activeTab === "requests" ? "var(--dp-accent)" : "currentColor")}
          Trip Requests
          {requests.length > 0 && (
            <span className="dp-tab-badge">{requests.length}</span>
          )}
        </button>

        <button
          className={`dp-tab ${activeTab === "history" ? "is-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          {Icon.history}
          Delivery History
        </button>
      </div>

      {/* Main content */}
      <div className="dp-content" key={activeTab}>

        {/* Stats always visible at top */}
        <StatsRow driver={driver} deliveries={deliveries} />

        {/* Tab content */}
        {activeTab === "requests" && (
          <TripRequestsTab
            requests={requests}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {activeTab === "history" && (
          <DeliveryHistoryTab
            deliveries={deliveries}
            driver={driver}
          />
        )}

      </div>
    </div>
  );
}