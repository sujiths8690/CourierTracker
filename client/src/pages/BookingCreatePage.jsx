import { useState, useEffect, useMemo, useRef } from "react";
import MapSection from "../components/MapSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyVehicles } from "../redux/features/vehicle/vehicleActions";
import { selectCustomers } from "../redux/features/customer/customerSelector";
import { fetchCustomers } from "../redux/features/customer/customerActions";
import { updateVehiclePosition } from "../redux/features/vehicle/vehicleSlice";
import { getDistanceKm } from "../utils/distance";
import { createBooking } from "../redux/features/booking/bookingActions";

// ─── Inject theme tokens as CSS custom properties on the root ─────────────────
// Bridges the `t` prop (JS theme object) into CSS variables so
// BookingCreatePage.css can use var(--bcp-*) without any inline styles.
function useThemeVars(el, t) {
  useEffect(() => {
    if (!el || !t) return;
    const map = {
      "--bcp-bg":           t.bg,
      "--bcp-surface":      t.surface,
      "--bcp-surface-alt":  t.surfaceAlt,
      "--bcp-border":       t.border,
      "--bcp-text":         t.text,
      "--bcp-text-muted":   t.textMuted,
      "--bcp-accent":       t.accent,
      "--bcp-accent-light": t.accentLight,
      "--bcp-input-bg":     t.inputBg,
      "--bcp-shadow":       t.shadow,
      "--bcp-success":      t.success,
      "--bcp-success-bg":   t.successBg,
      "--bcp-warning":      t.warning,
      "--bcp-warning-bg":   t.warningBg,
      "--bcp-danger":       t.danger,
      "--bcp-danger-bg":    t.dangerBg,
      "--bcp-info":         t.info,
      "--bcp-info-bg":      t.infoBg,
    };
    Object.entries(map).forEach(([k, v]) => el.style.setProperty(k, v));
  }, [el, t]);
}

// ─── Vehicle type SVG icon ────────────────────────────────────────────────────
function VehicleIcon({ type, selected }) {
  const color = selected ? "#fff" : "var(--bcp-accent)";
  const lc = (type || "").toLowerCase();

  if (lc.includes("bike") || lc.includes("moto")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6h-3l-2 6H5.5" />
        <path d="M12 6l3 6h3" />
      </svg>
    );
  }

  if (lc.includes("van") || lc.includes("mini")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="8" width="18" height="10" rx="2" />
        <path d="M19 12h2l1 4H19" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="15" cy="18" r="2" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="15" height="9" rx="1" />
      <path d="M16 13h5l1 5H16z" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="18.5" cy="18" r="2" />
      <path d="M1 9V6a1 1 0 011-1h10l4 4" />
    </svg>
  );
}

// ─── Step dot ─────────────────────────────────────────────────────────────────
function StepDot({ num, label, active, done }) {
  return (
    <div className="bcp-step-dot-wrap">
      <div className={`bcp-step-circle ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
        {done ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3 3 6-6" stroke="#fff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : num}
      </div>
      <span className={`bcp-step-label ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Step connector line ──────────────────────────────────────────────────────
function StepLine({ done }) {
  return <div className={`bcp-step-line ${done ? "is-done" : ""}`} />;
}

// ─── Status → CSS modifier class ──────────────────────────────────────────────
function statusClass(status = "") {
  const l = status.toLowerCase();
  if (l.includes("active"))  return "status-active";
  if (l.includes("transit")) return "status-transit";
  if (l.includes("idle"))    return "status-idle";
  return "status-info";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingCreatePage({ setPage, t }) {
  const dispatch       = useDispatch();
  const nearbyVehicles = useSelector(
    (state) => state.vehicle.nearbyVehicles || []
  );
  const customers = useSelector(selectCustomers);
  const [destinationRoute, setDestinationRoute] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [vehicleRouteMeta, setVehicleRouteMeta] = useState({});
  const [destinationRouteMeta, setDestinationRouteMeta] = useState(null);
  const [debouncedVehicles, setDebouncedVehicles] = useState([]);

  const latestVehicleUpdates = useRef({});

  console.log("vehicles:", nearbyVehicles);
  console.log("vehicle sample:", nearbyVehicles[0]);

  const [routeCoords, setRouteCoords] = useState([]);

  const getVehicleTimeMultiplier = (type) => {
    const t = (type || "").toLowerCase();

    if (t.includes("truck")) return 2.5;   // slower
    if (t.includes("pickup")) return 1.2;  // medium
    if (t.includes("bike")) return 0.8;    // faster

    return 1; // default
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedVehicles(nearbyVehicles);
    }, 500);

    return () => clearTimeout(t);
  }, [nearbyVehicles]);

  useEffect(()=>{
    dispatch(fetchCustomers());
  },[dispatch]);

    useEffect(() => {
        const ws = new WebSocket("ws://192.168.1.84:3003");

        ws.onopen = () => {
            ws.send(JSON.stringify({
            type: "SUBSCRIBE"
            }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "VEHICLE_LOCATION") {
            // store latest update (don't dispatch immediately)
            latestVehicleUpdates.current[data.vehicleId] = data;
          }
        };

        return () => ws.close();
    }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updates = Object.values(latestVehicleUpdates.current);

      updates.forEach((update) => {
        dispatch(updateVehiclePosition(update));
      });

      // clear buffer
      latestVehicleUpdates.current = {};

    }, 60000); 

    return () => clearInterval(interval);
  }, [dispatch]);

  const formatArrivalTime = (minutes) => {
    if (!minutes) return "--";

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);

    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTrafficColor = (time, distance) => {
    if (!time || !distance) return "#999";

    const speed = distance / (time / 60); // km/h

    if (speed > 40) return "green";   // smooth
    if (speed > 20) return "orange";  // medium
    return "red";                     // heavy
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query) {
        setSearchResults([]);
        return;
    }

    try {
        setSearching(true);

        const res = await fetch(
        `https://us1.locationiq.com/v1/search?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&q=${query}&format=json`
        );

        const data = await res.json();

        setSearchResults(data || []);
    } catch (err) {
        console.error("Search error:", err);
    } finally {
        setSearching(false);
    }
    };

    const handleSelectLocation = (place) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        setForm((prev) => ({
            ...prev,
            pickupLat: lat,
            pickupLng: lng,
            pickupAddress: place.display_name,
        }));

        setSearchResults([]);
        setSearchQuery(place.display_name);
    };

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setCurrentLocation({ lat, lng });

            dispatch(fetchNearbyVehicles({
                lat,
                lng,
                radius: 20
            }));

            },
            () => {
            const fallback = { lat: 9.9312, lng: 76.2673 };

            setCurrentLocation(fallback);

            dispatch(fetchNearbyVehicles({
                ...fallback,
                radius: 20
            }));
            }
        );
        }, [dispatch]);

  const [rootEl,     setRootEl]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState({
    customerId:    "",
    vehicleId:     "",
    pickupLat:     null,
    pickupLng:     null,
    pickupAddress: "",
  });

  const formatDuration = (minutes) => {
    if (!minutes) return "--";

    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;

    return `${hrs} hr ${mins} min`;
  };

  const vehiclesWithMeta = nearbyVehicles.map(v => {
    if (!form.pickupLat || !v.lastLat) {
      return {
        ...v,
        distance: null,
        timeMin: null
      };
    }

    const distance = getDistanceKm(
      form.pickupLat,
      form.pickupLng,
      v.lastLat,
      v.lastLng
    );

    const baseSpeed = 30;
    const adjustedSpeed = baseSpeed / getVehicleTimeMultiplier(v.type);
    const timeMin = (distance / adjustedSpeed) * 60;

    return {
      ...v,
      distance,
      timeMin
    };
  });

  // Inject CSS custom properties from the `t` theme object
  useThemeVars(rootEl, t);

  const selectedCustomer = customers.find((c) => c.id == form.customerId);
  const canSubmit        = form.customerId && form.pickupLat && form.vehicleId;

    useEffect(() => {
      if (!form.pickupLat || !selectedCustomer) return;

      const fetchRoute = async () => {
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${form.pickupLng},${form.pickupLat};${selectedCustomer.lng},${selectedCustomer.lat}?overview=full&geometries=geojson`
          );

          const data = await res.json();

          const route = data.routes[0];

          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

          setDestinationRoute(coords);

          const baseTime = route.duration / 60;

          const vehicle = nearbyVehicles.find(v => v.id === form.vehicleId);

          const adjustedTime = baseTime * getVehicleTimeMultiplier(vehicle?.type);

          setDestinationRouteMeta({
            distance: route.distance / 1000,
            time: adjustedTime
          });

        } catch (err) {
          console.error("Destination route error:", err);
        }
      };

    fetchRoute();
  }, [form.pickupLat, selectedCustomer]);


  const handleMapClick = async (location) => {
    const { lat, lng } = location;

    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();

      const address = data.display_name || `${lat}, ${lng}`;

      setForm((prev) => ({
        ...prev,
        pickupLat: lat,
        pickupLng: lng,
        pickupAddress: address,
      }));

    } catch (err) {
      console.error("Reverse geocoding failed:", err);

      // fallback
      setForm((prev) => ({
        ...prev,
        pickupLat: lat,
        pickupLng: lng,
        pickupAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      }));
    }
  };

  const handleCustomerChange = (e) => {
    setForm({
      ...form,
      customerId: Number(e.target.value) // ✅ FIX
    });

    if (e.target.value) setStep((s) => Math.max(s, 2));
  };

  const handleVehicleSelect = async (vehicleId) => {
    setForm({ ...form, vehicleId });

    const vehicle = nearbyVehicles.find(v => v.id === vehicleId);

    if (!vehicle || !form.pickupLat) return;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${vehicle.lastLng},${vehicle.lastLat};${form.pickupLng},${form.pickupLat}?overview=full&geometries=geojson`
      );

      const data = await res.json();

      const route = data.routes[0];

      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

      setRouteCoords(coords);

      // ✅ NEW
      const baseTime = route.duration / 60;

      const adjustedTime = baseTime * getVehicleTimeMultiplier(vehicle.type);

      setVehicleRouteMeta(prev => ({
        ...prev,
        [vehicleId]: {
          distance: route.distance / 1000,
          time: adjustedTime
        }
      }));

    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const result = await dispatch(createBooking(form));

      console.log("Submitting form:", form);

      console.log("API result:", result);

      if (result.meta.requestStatus === "fulfilled") {
        setPage("dashboard");
      }

    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const validVehicles = vehiclesWithMeta.filter(v => v.distance != null);

  const closestVehicleId = useMemo(() => {
    if (!form.pickupLat) return null;

    const valid = vehiclesWithMeta.filter(v => v.timeMin != null);

    if (valid.length === 0) return null;

    return valid.reduce((prev, curr) =>
      prev.timeMin < curr.timeMin ? prev : curr
    ).id;

  }, [vehiclesWithMeta, form.pickupLat]);

  const bestByTime = useMemo(() => {
    const valid = vehiclesWithMeta.filter(v => v.timeMin != null);
    if (!valid.length) return null;

    return valid.reduce((prev, curr) =>
      prev.timeMin < curr.timeMin ? prev : curr
    ).id;
  }, [vehiclesWithMeta]);

  const bestByPrice = useMemo(() => {
    if (!vehiclesWithMeta.length) return null;

    return vehiclesWithMeta.reduce((prev, curr) =>
      prev.pricePerKm < curr.pricePerKm ? prev : curr
    ).id;
  }, [vehiclesWithMeta]);

  const bestByDistance = useMemo(() => {
    const valid = vehiclesWithMeta.filter(v => v.distance != null);
    if (!valid.length) return null;

    return valid.reduce((prev, curr) =>
      prev.distance < curr.distance ? prev : curr
    ).id;
  }, [vehiclesWithMeta]);

  const getVehicleTag = (v) => {
    // Priority: Fastest > Cheapest > Closest

    if (v.id === bestByTime) {
      return { label: "Fastest", className: "tag-fastest" };
    }

    if (v.id === bestByPrice && v.id !== bestByTime) {
      return { label: "Cheapest", className: "tag-cheapest" };
    }

    if (
      v.id === bestByDistance &&
      v.id !== bestByTime &&
      v.id !== bestByPrice
    ) {
      return { label: "Closest", className: "tag-closest" };
    }

    return null;
  };

  useEffect(() => {
  if (!form.vehicleId || !form.pickupLat) return;

  const vehicle = nearbyVehicles.find(v => v.id === form.vehicleId);
  if (!vehicle) return;

  const fetchRoute = async () => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${vehicle.lastLng},${vehicle.lastLat};${form.pickupLng},${form.pickupLat}?overview=full&geometries=geojson`
      );

      const data = await res.json();
      const route = data.routes[0];

      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      setRouteCoords(coords);

      const baseTime = route.duration / 60;
      const adjustedTime = baseTime * getVehicleTimeMultiplier(vehicle.type);

      setVehicleRouteMeta(prev => ({
        ...prev,
        [form.vehicleId]: {
          distance: route.distance / 1000,
          time: adjustedTime
        }
      }));

    } catch (err) {
      console.error("Live route update error:", err);
    }
  };

  fetchRoute();

  }, [nearbyVehicles, form.vehicleId, form.pickupLat]);

  useEffect(() => {
    if (!form.vehicleId && closestVehicleId) {
      setForm(prev => ({
        ...prev,
        vehicleId: closestVehicleId
      }));
    }
  }, [closestVehicleId]);

  const totalDeliveryTime =
    (vehicleRouteMeta[form.vehicleId]?.time || 0) +
    (destinationRouteMeta?.time || 0);

  const pickupDistance =
  vehicleRouteMeta[form.vehicleId]?.distance || 0;

  const deliveryDistance =
    destinationRouteMeta?.distance || 0;

  const totalDistance = pickupDistance + deliveryDistance;

  const selectedVehicle = nearbyVehicles.find(
    v => v.id === form.vehicleId
  );

  const rawCost = selectedVehicle
  ? totalDistance * selectedVehicle.pricePerKm
  : 0;

  const totalCost = Math.round(rawCost / 10) * 10;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bcp-root" ref={setRootEl}>
      <div className="bcp-inner">

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="bcp-topbar">
          <button className="bcp-back-btn" onClick={() => setPage("dashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div>
            <h2 className="bcp-page-title">Create Booking</h2>
            <p className="bcp-page-subtitle">Fill in the details below to dispatch a new delivery</p>
          </div>
        </div>

        {/* ── Cards ──────────────────────────────────────────────────────── */}
        <div className="bcp-cards">
          <div className="bcp-left">
          {/* ── Card 1 · Customer ──────────────────────────────────────── */}
          <div className="bcp-card">
              <div className="bcp-card-header">
                <div className="bcp-card-icon icon-customer">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="var(--bcp-accent)" strokeWidth="1.5" />
                    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"
                      stroke="var(--bcp-accent)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="bcp-card-title">Customer</h3>

                {selectedCustomer && (
                  <div className="bcp-card-header-right">
                    <div className="bcp-avatar sm">{selectedCustomer.name[0]}</div>
                    <span className="bcp-badge-customer-name"></span>
                  </div>
                )}
              </div>

              <div className="bcp-card-body">
                <p className="bcp-section-label">Select Customer</p>

                <select
                  className="bcp-select"
                  value={form.customerId}
                  onChange={handleCustomerChange}
                >
                  <option value="">Choose a customer…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {selectedCustomer && (
                  <div className="bcp-customer-preview">
                    <div className="bcp-avatar">{selectedCustomer.name[0]}</div>
                      <div className="bcp-customer-details">
                        <p className="bcp-customer-name">{selectedCustomer.name}</p>
                        <p className="bcp-customer-address">
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1a4 4 0 014 4c0 3-4 7-4 7S2 8 2 5a4 4 0 014-4z"
                              stroke="var(--bcp-text-muted)" strokeWidth="1.2" />
                            <circle cx="6" cy="5" r="1.2"
                              stroke="var(--bcp-text-muted)" strokeWidth="1.2" />
                          </svg>
                          {selectedCustomer.address}
                        </p>
                        <p className="bcp-customer-coords">
                          {selectedCustomer.lat}°N · {selectedCustomer.lng}°E
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

          {/* ── Card 2 · Pickup on map ──────────────────────────────────── */}
          <div className="bcp-card">
            <div className="bcp-card-header">
              <div className="bcp-card-icon icon-pickup">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5a4.5 4.5 0 014.5 4.5C12.5 9.5 8 14.5 8 14.5S3.5 9.5 3.5 6A4.5 4.5 0 018 1.5z"
                    stroke="var(--bcp-info)" strokeWidth="1.5" />
                  <circle cx="8" cy="6" r="1.5" stroke="var(--bcp-info)" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className="bcp-card-title">Pickup Location</h3>

              {/* {form.pickupLat && (
                <div className="bcp-card-header-right">
                  <span className="bcp-badge-coords">
                    {form.pickupLat.toFixed(4)}°N · {form.pickupLng.toFixed(4)}°E
                  </span>
                </div>
              )} */}
            </div>

            <div className={`bcp-pickup-hint ${form.pickupLat ? "has-value" : ""}`}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5"
                  stroke="var(--bcp-text-muted)" strokeWidth="1.2" />
                <path d="M6.5 4v3l2 1"
                  stroke="var(--bcp-text-muted)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {form.pickupAddress || "Tap anywhere on the map to set pickup point"}
            </div>

            <div className="bcp-search-wrap">
                <input
                    type="text"
                    placeholder="Search pickup location..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bcp-search-input"
                />

                {searching && <div className="bcp-search-loading">Searching...</div>}

                {searchResults.length > 0 && (
                    <div className="bcp-search-results">
                      {searchResults.slice(0, 5).map((place, index) => (
                          <div
                          key={index}
                          className="bcp-search-item"
                          onClick={() => handleSelectLocation(place)}
                          >
                          {place.display_name}
                          </div>
                      ))}
                    </div>
                )}
            </div>

            <div className="bcp-map-wrap">
              <MapSection
                pos={
                  form.pickupLat
                    ? [form.pickupLat, form.pickupLng]
                    : currentLocation
                    ? [currentLocation.lat, currentLocation.lng]
                    : [9.9312, 76.2673]
                }
                isCurrentLocation={!form.pickupLat}
                onSelect={handleMapClick}
                vehicles={vehiclesWithMeta.map(v => ({
                  ...v,
                  lat: v.lastLat,
                  lng: v.lastLng,
                  eta: v.timeMin 
                }))}
                showVehicles={true}
                clickable={true}
                route= {routeCoords}
                routeMeta={vehicleRouteMeta[form.vehicleId]}  
                destination={
                  selectedCustomer
                    ? [selectedCustomer.lat, selectedCustomer.lng]
                    : null
                }
                destinationRoute={destinationRoute}
                destinationMeta={destinationRouteMeta}
                onVehicleSelect={handleVehicleSelect}
                selectedVehicleId={form.vehicleId}
                onClearVehicle={() => {
                    setForm(prev => ({
                      ...prev,
                      vehicleId: ""   // ✅ clear selection
                    }));
                  }} 
                />
            </div>

            {(vehicleRouteMeta[form.vehicleId] || destinationRouteMeta) && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              marginTop: 10,
              padding: 12,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}>

              {/* 🚚 PICKUP */}
              {vehicleRouteMeta[form.vehicleId] && (
                <div style={{ flex: 1 }}>

                  {/* TIME */}
                  <div style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: getTrafficColor(
                      vehicleRouteMeta[form.vehicleId].time,
                      vehicleRouteMeta[form.vehicleId].distance
                    )
                  }}>
                    {formatDuration(vehicleRouteMeta[form.vehicleId].time)}
                  </div>

                  {/* KM + ARRIVAL */}
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {vehicleRouteMeta[form.vehicleId].distance.toFixed(2)} km · 
                    Arrives at {formatArrivalTime(vehicleRouteMeta[form.vehicleId].time)}
                  </div>

                  {/* LABEL */}
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Pickup
                  </div>

                </div>
              )}

              {/* 📍 DESTINATION */}
              {destinationRouteMeta && (
                <div style={{ flex: 1, textAlign: "right" }}>

                  {/* TIME */}
                  <div style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: getTrafficColor(
                      destinationRouteMeta.time,
                      destinationRouteMeta.distance
                    )
                  }}>
                    {formatDuration(totalDeliveryTime)}
                  </div>

                  {/* KM + ETA */}
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {destinationRouteMeta.distance.toFixed(2)} km · 
                    Delivery at {formatArrivalTime(totalDeliveryTime)}
                  </div>

                  {/* LABEL */}
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Destination
                  </div>

                </div>
              )}

            </div>
          )}
          </div>
        </div>

        <div className="bcp-right">

          {/* ── Card 3 · Vehicle ────────────────────────────────────────── */}
          <div className="bcp-card">
            <div className="bcp-card-header">
              <div className="bcp-card-icon icon-vehicle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="var(--bcp-warning)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="9" width="15" height="9" rx="1" />
                  <path d="M16 13h5l1 5H16z" />
                  <circle cx="5.5" cy="18" r="2" />
                  <circle cx="18.5" cy="18" r="2" />
                  <path d="M1 9V6a1 1 0 011-1h10l4 4" />
                </svg>
              </div>
              <h3 className="bcp-card-title">Select Vehicle</h3>

              {nearbyVehicles.length > 0 && (
                <span className="bcp-badge-nearby">{nearbyVehicles.length} nearby</span>
              )}
            </div>

            <div className="bcp-card-body">

              {/* No pickup selected yet */}
              {!form.pickupLat && (
                <div className="bcp-vehicle-empty">
                  <div className="bcp-empty-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="var(--bcp-text-muted)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <p className="bcp-empty-text">Select a pickup point on the map first</p>
                </div>
              )}

              {/* Pickup set, waiting for results */}
              {form.pickupLat && nearbyVehicles.length === 0 && (
                <div className="bcp-vehicle-empty">
                  <div className="bcp-empty-icon-wrap is-loading">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="var(--bcp-text-muted)" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="9" width="15" height="9" rx="1" />
                      <path d="M16 13h5l1 5H16z" />
                      <circle cx="5.5" cy="18" r="2" />
                      <circle cx="18.5" cy="18" r="2" />
                    </svg>
                  </div>
                  <p className="bcp-empty-text">Looking for available vehicles nearby…</p>
                </div>
              )}

              {/* Vehicle list */}
              {nearbyVehicles.length > 0 && (
                <div className="bcp-vehicle-list">
                  {vehiclesWithMeta.map((v) => {
                    const selected = form.vehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        className={`bcp-vehicle-row 
                          ${selected ? "is-selected" : ""} 
                          ${v.id === closestVehicleId ? "is-closest" : ""}
                        `}
                        onClick={() => handleVehicleSelect(v.id)}
                      >
                        {getVehicleTag(v) && (
                          <div className={`vehicle-tag ${getVehicleTag(v).className}`}>
                            {getVehicleTag(v).label}
                          </div>
                        )}
                        <div className="bcp-vehicle-icon-box">
                          <VehicleIcon type={v.type} selected={selected} />
                        </div>

                        <div className="bcp-vehicle-info">
                          <p className="bcp-vehicle-meta">{v.type} · {v.owner}</p>
                          {vehicleRouteMeta[v.id] ? (
                              <p style={{ fontSize: 12, color: "#007bff" }}>
                                {vehicleRouteMeta[v.id].distance.toFixed(2)} km · 
                                {formatDuration(vehicleRouteMeta[v.id].time)}
                              </p>
                            ) : (
                              <p style={{ fontSize: 12, color: "#888" }}>
                                {v.distance != null && v.timeMin != null
                                  ? `${v.distance.toFixed(2)} km · ${formatDuration(v.timeMin)}`
                                  : "Choose location"}
                              </p>
                            )}
                        </div>

                        <div className="bcp-vehicle-price-col">
                          <div className="bcp-price-value">
                            ₹{v.pricePerKm}
                            <span className="bcp-price-unit">/km</span>
                          </div>
                          <div className="bcp-selector-hint">
                            {selected
                              ? <span className="bcp-pill status-selected">Selected</span>
                              : "Tap to select"
                            }
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Summary + Submit ────────────────────────────────────────── */}
          {canSubmit && (
            <div className="bcp-card is-summary">
              <div className="bcp-card-body">
                <p className="bcp-summary-label">Booking Summary</p>

                <div className="bcp-summary-grid">

                  {/* ROW 1: Name + Vehicle (same row) */}
                  <div className="bcp-summary-row top-row">

                    <div>
                      <p className="bcp-summary-item-label">Customer</p>
                      <p className="bcp-summary-item-value">
                        {selectedCustomer?.name || "—"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p className="bcp-summary-item-label">Vehicle</p>
                      <p className="bcp-summary-item-value">
                        {selectedVehicle?.number || "—"}
                      </p>
                    </div>

                  </div>

                  {/* ROW 2: Pickup */}
                  <div className="bcp-summary-row">
                    <p className="bcp-summary-item-label">Pickup</p>
                    <p className="bcp-summary-item-value">
                      {form.pickupAddress || "—"}
                    </p>
                  </div>

                  {/* ROW 3: Destination */}
                  <div className="bcp-summary-row">
                    <p className="bcp-summary-item-label">Destination</p>
                    <p className="bcp-summary-item-value">
                      {selectedCustomer?.address || "—"}
                    </p>
                  </div>

                  {/* ROW 4: Cost aligned right */}
                  <div className="bcp-summary-row cost-row">
                    <div className="bcp-cost-box">
                      ₹{totalCost}
                    </div>
                  </div>

                </div>

                <button
                  className="bcp-submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="bcp-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6"
                          stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                        <path d="M8 2a6 6 0 016 6"
                          stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Dispatching…
                    </>
                  ) : (
                    <>
                      Confirm &amp; Dispatch
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>{/* end .bcp-right */}
        </div>{/* end .bcp-cards */}
      </div>{/* end .bcp-inner */}
    </div>
  );
}
