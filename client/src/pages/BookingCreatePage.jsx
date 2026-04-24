import { useState, useEffect } from "react";
import MapSection from "../components/MapSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyVehicles } from "../redux/features/vehicle/vehicleActions";

// ─── Vehicle Icon Component ─────────────────────────────────────
const VehicleIcon = ({ type, color }) => {
  const t = (type || "").toLowerCase();
  if (t.includes("bike") || t.includes("moto")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6h-3l-2 6H5.5" />
        <path d="M12 6l3 6h3" />
      </svg>
    );
  }
  if (t.includes("van") || t.includes("mini")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="8" width="18" height="10" rx="2" />
        <path d="M19 12h2l1 4H19" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="15" cy="18" r="2" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="15" height="9" rx="1" />
      <path d="M16 13h5l1 5H16z" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="18.5" cy="18" r="2" />
      <path d="M1 9V6a1 1 0 011-1h10l4 4" />
    </svg>
  );
};

// ─── Step Indicator Components ─────────────────────────────────
const StepDot = ({ num, label, active, done, t }) => (
  <div className="step-dot">
    <div className={`step-circle ${done ? 'done' : active ? 'active' : ''}`}>
      {done ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : num}
    </div>
    <span className={`step-label ${active ? 'active' : done ? 'done' : ''}`}>{label}</span>
  </div>
);

const StepLine = ({ done }) => <div className={`step-line ${done ? 'done' : ''}`} />;

// ─── Main Component ─────────────────────────────────────────────
export default function BookingCreatePage({ customers, setPage, createBooking, t }) {
  const dispatch = useDispatch();
  const nearbyVehicles = useSelector((state) => state.vehicle.nearbyVehicles || []);

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    pickupLat: null,
    pickupLng: null,
    pickupAddress: "",
  });

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const selectedCustomer = customers.find((c) => c.id == form.customerId);

  useEffect(() => {
    if (form.pickupLat && form.pickupLng) {
      dispatch(fetchNearbyVehicles({ lat: form.pickupLat, lng: form.pickupLng, radius: 10 }));
      setStep(3);
    }
  }, [form.pickupLat, form.pickupLng]);

  const handleMapClick = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      pickupLat: lat,
      pickupLng: lng,
      pickupAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      createBooking(form);
      setPage("dashboard");
    }, 600);
  };

  const canSubmit = form.customerId && form.pickupLat && form.vehicleId;

  return (
    <div className="booking-create-page" style={{ '--accent': t.accent, '--success': t.success, '--warning': t.warning, '--text': t.text, '--bg': t.bg, '--surface': t.surface, '--border': t.border, '--text-muted': t.textMuted, '--surface-alt': t.surfaceAlt, '--accent-light': t.accentLight, '--success-bg': t.successBg, '--warning-bg': t.warningBg, '--info': t.info, '--info-bg': t.infoBg }}>
      
      <FontLoader />

      {/* Top Bar */}
      <div className="top-bar">
        <button onClick={() => setPage("dashboard")} className="back-button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div>
          <h2 className="page-title">Create Booking</h2>
          <p className="page-subtitle">Fill in the details below to dispatch a new delivery</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-container">
        <div className="step-wrapper">
          <StepDot num={1} label="Customer" active={step === 1} done={step > 1} t={t} />
          <StepLine done={step > 1} />
          <StepDot num={2} label="Pickup" active={step === 2} done={step > 2} t={t} />
          <StepLine done={step > 2} />
          <StepDot num={3} label="Vehicle" active={step === 3} done={canSubmit} t={t} />
        </div>
      </div>

      <div className="content-container">
        {/* Customer Card */}
        <div className="card customer-card">
          {/* ... (rest of your JSX with classNames) */}
          {/* I'll show the pattern below */}
        </div>

        {/* Pickup Card */}
        <div className="card pickup-card">
          <div className="card-header">
            <h3>Select Pickup Location</h3>
          </div>

          <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden" }}>
            <MapSection
              pos={
                form.pickupLat
                  ? [form.pickupLat, form.pickupLng]
                  : [9.9312, 76.2673]
              }
              onSelect={(data) => {
                setForm((prev) => ({
                  ...prev,
                  pickupLat: data.lat,
                  pickupLng: data.lng,
                  pickupAddress: data.name,
                }));
                setStep(2);
              }}
              vehicles={nearbyVehicles}
              showVehicles={true}
            />
          </div>

          {form.pickupAddress && (
            <div className="pickup-address-box">
              📍 {form.pickupAddress}
            </div>
          )}
        </div>

        {/* Vehicle Card */}
        <div className="card vehicle-card">
          <div className="card-header">
            <h3>Available Vehicles</h3>
          </div>

          {!form.pickupLat ? (
            <div className="empty-text">Select pickup location first</div>
          ) : nearbyVehicles.length === 0 ? (
            <div className="empty-text">No vehicles nearby</div>
          ) : (
            <div className="vehicle-list">
              {nearbyVehicles.map((v) => (
                <div
                  key={v.id}
                  className={`vehicle-item ${
                    form.vehicleId === v.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      vehicleId: v.id,
                    }))
                  }
                >
                  <div className="vehicle-left">
                    <VehicleIcon type={v.type} color="#333" />
                    <div>
                      <div className="vehicle-name">{v.number}</div>
                      <div className="vehicle-type">{v.type}</div>
                    </div>
                  </div>

                  <div className="vehicle-right">
                    ₹{v.pricePerKm}/km
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        {canSubmit && (
        <div className="card summary-card">
          <h3>Booking Summary</h3>

          <div className="summary-row">
            <span>Customer</span>
            <span>{selectedCustomer?.name}</span>
          </div>

          <div className="summary-row">
            <span>Pickup</span>
            <span>{form.pickupAddress}</span>
          </div>

          <div className="summary-row">
            <span>Vehicle</span>
            <span>
              {
                nearbyVehicles.find(v => v.id === form.vehicleId)?.number
              }
            </span>
          </div>

          <button
            className="confirm-btn"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Creating..." : "Confirm Booking"}
          </button>
        </div>
      )}
      </div>

      <style jsx>{`
        /* Any remaining dynamic styles if needed */
      `}</style>
    </div>
  );
}

// Font Loader
const FontLoader = () => {
  useEffect(() => {
    if (document.getElementById("courierflow-fonts")) return;
    const link = document.createElement("link");
    link.id = "courierflow-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,600&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
};