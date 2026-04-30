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

import { useEffect, useState } from "react";
import { useThemeVars } from "./Hooks";
import { theme } from "./Theme";
import { Icon } from "./Helpers";
import api from "../common/api";
import { getDistanceKm } from "../utils/distance";
import Navbar            from "./Navbar";
import StatsRow          from "./StatsRow";
import TripRequestsTab   from "./TripRequestsTab";
import DeliveryHistoryTab from "./DeliveryHistoryTab";
import LocationOverlay   from "./LocationOverlay";
import Toast             from "./Toast";
import DriverRouteMap    from "./DriverRouteMap";

export default function Dashboard({ driver, onLogout, darkMode, setDarkMode }) {
  const [rootEl,      setRootEl]      = useState(null);
  const [activeTab,   setActiveTab]   = useState("requests");
  const [requests,    setRequests]    = useState([]);
  const [deliveries,  setDeliveries]  = useState([]);
  const [locationFor, setLocationFor] = useState(null); // request awaiting location
  const [toast,       setToast]       = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTrip,  setActiveTrip]  = useState(null);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const t = darkMode ? theme.dark : theme.light;
  useThemeVars(rootEl, t);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => setToast({ message, type });
  const driverAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("driverToken") || ""}`
  });

  const getCurrentCoords = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS is not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      () => reject(new Error("Allow location access to go available.")),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
  });

  const normalizeRequest = (booking) => {
    const vehicleLat = booking.VehicleDetails?.lastLat || booking.lastLat || 0;
    const vehicleLng = booking.VehicleDetails?.lastLng || booking.lastLng || 0;
    const distToPickup = vehicleLat && vehicleLng
      ? getDistanceKm(vehicleLat, vehicleLng, booking.pickupLat, booking.pickupLng)
      : 0;
    const pickupToDest = getDistanceKm(
      booking.pickupLat,
      booking.pickupLng,
      booking.destLat,
      booking.destLng
    );
    const pricePerKm = booking.VehicleDetails?.pricePerKm || 0;

    return {
      id: booking.id,
      bookingId: booking.bookingId,
      customer: booking.Customer?.name || "Customer",
      phone: booking.Customer?.mobileNumber || "N/A",
      pickupAddress: booking.pickupAddress,
      pickupLat: booking.pickupLat,
      pickupLng: booking.pickupLng,
      destinationAddress: booking.destAddress,
      destinationLat: booking.destLat,
      destinationLng: booking.destLng,
      driverLat: vehicleLat,
      driverLng: vehicleLng,
      distToPickup,
      pickupToDest,
      totalKm: distToPickup + pickupToDest,
      estimatedEarnings: Math.round((distToPickup + pickupToDest) * pricePerKm),
      requestedAt: "New request",
      isNew: true,
      raw: booking
    };
  };

  const formatDeliveryDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) return "Today";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const normalizeDelivery = (booking) => {
    const statusMap = {
      ONGOING: "accepted",
      LOADING: "picked up",
      COMPLETED: "delivered",
      CANCELLED: "cancelled"
    };
    const progressMap = {
      ONGOING: 0,
      LOADING: 45,
      COMPLETED: 100,
      CANCELLED: 0
    };
    const distance = getDistanceKm(
      booking.pickupLat,
      booking.pickupLng,
      booking.destLat,
      booking.destLng
    );
    const pricePerKm = booking.VehicleDetails?.pricePerKm || 0;

    return {
      id: booking.bookingId || `Booking #${booking.id}`,
      bookingDbId: booking.id,
      customer: booking.Customer?.name || "Customer",
      pickup: booking.pickupAddress,
      destination: booking.destAddress,
      distance,
      earnings: Math.round(distance * pricePerKm),
      status: statusMap[booking.status] || booking.status.toLowerCase(),
      date: formatDeliveryDate(booking.updatedAt || booking.createdAt),
      progress: progressMap[booking.status] ?? 0,
      driverLat: booking.lastLat,
      driverLng: booking.lastLng,
      backendStatus: booking.status
    };
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get("/booking/driver/requests", {
        headers: driverAuthHeaders()
      });
      setRequests((res.data.data || []).map(normalizeRequest));
    } catch (err) {
      console.error("Driver request fetch failed:", err);
    }
  };

  const fetchDeliveryHistory = async () => {
    try {
      const res = await api.get("/booking/driver/history", {
        headers: driverAuthHeaders()
      });
      const bookings = res.data.data || [];
      const normalized = bookings.map(normalizeDelivery);

      setDeliveries(normalized);
      setActiveTrip(
        bookings.find((booking) => booking.status === "ONGOING" || booking.status === "LOADING") || null
      );
    } catch (err) {
      console.error("Driver delivery history fetch failed:", err);
    }
  };

  useEffect(() => {
    const fetchVehicleStatus = async () => {
      try {
        const res = await api.get(`/vehicle/${driver.vehicleId}`, {
          headers: driverAuthHeaders()
        });

        setIsAvailable(res.data.data?.status === "AVAILABLE");
      } catch (err) {
        console.error("Driver vehicle status fetch failed:", err);
      }
    };

    fetchVehicleStatus();
    const initialLoad = setTimeout(() => {
      fetchRequests();
      fetchDeliveryHistory();
    }, 0);
    const interval = setInterval(fetchRequests, 5000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.vehicleId]);

  useEffect(() => {
    if (!isAvailable || !driver.vehicleId || activeTrip) return;

    const publishLocation = async (coords) => {
      try {
        await api.put(
          `/vehicle/${driver.vehicleId}/location`,
          coords,
          { headers: driverAuthHeaders() }
        );
      } catch (err) {
        console.error("Vehicle location publish failed:", err);
      }
    };

    getCurrentCoords().then(publishLocation).catch(() => {});

    const watchId = navigator.geolocation?.watchPosition(
      (pos) => publishLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      (err) => console.error("Availability GPS watch failed:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTrip, driver.vehicleId, isAvailable]);

  useEffect(() => {
    if (!activeTrip) return;

    const sendTrackingLocation = async (coords) => {
      try {
        await api.patch(`/tracking/updateLocation/${activeTrip.id}`, coords);
        setActiveTrip((trip) => trip
          ? {
              ...trip,
              lastLat: coords.lat,
              lastLng: coords.lng,
              lastUpdated: new Date().toISOString()
            }
          : trip
        );
      } catch (err) {
        console.error("Tracking location update failed:", err);
      }
    };

    const watchId = navigator.geolocation?.watchPosition(
      (pos) => sendTrackingLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      (err) => console.error("Trip GPS watch failed:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTrip]);

  const updateDeliveryFromBooking = (booking, status, progress) => {
    setDeliveries((ds) => ds.map((delivery) => (
      delivery.bookingDbId === booking.id || delivery.id === booking.bookingId
        ? {
            ...delivery,
            status,
            progress,
            driverLat: booking.lastLat ?? delivery.driverLat,
            driverLng: booking.lastLng ?? delivery.driverLng
          }
        : delivery
    )));
  };

  const confirmTripMilestone = async (action) => {
    if (!activeTrip?.id) return;

    try {
      const coords = await getCurrentCoords().catch(() => ({}));
      const endpoint = action === "pickup" ? "pickup" : "delivered";
      const res = await api.patch(
        `/booking/driver/requests/${activeTrip.id}/${endpoint}`,
        coords,
        { headers: driverAuthHeaders() }
      );
      const booking = res.data.data;

      setActiveTrip(action === "delivered" ? null : booking);
      if (action === "delivered") setShowRouteMap(false);

      if (action === "pickup") {
        updateDeliveryFromBooking(booking, "picked up", 45);
        showToast("Pickup confirmed. Tracking updated.", "success");
        return;
      }

      updateDeliveryFromBooking(booking, "delivered", 100);
      setIsAvailable(true);
      fetchDeliveryHistory();
      showToast("Delivery completed. Vehicle is available again.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update trip.", "danger");
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const nextAvailable = !isAvailable;
      const coords = nextAvailable ? await getCurrentCoords() : {};

      await api.patch(
        `/vehicle/${driver.vehicleId}/availability`,
        {
          available: nextAvailable,
          ...coords
        },
        { headers: driverAuthHeaders() }
      );

      setIsAvailable(nextAvailable);
      showToast(
        nextAvailable
          ? "You are available for ride requests."
          : "You are offline for new rides.",
        "success"
      );
    } catch (err) {
      showToast(err.message || "Could not update availability.", "danger");
    }
  };

  // Driver tapped Accept → open location overlay first
  const handleAccept = (req) => setLocationFor(req);

  // Location acquired → confirm acceptance, attach driver coords to record
  const handleConfirmAccept = async (req, coords) => {
    try {
      const res = await api.patch(
        `/booking/driver/requests/${req.id}/accept`,
        coords,
        { headers: driverAuthHeaders() }
      );
      const accepted = res.data.data;

      setRequests((rs) => rs.filter((r) => r.id !== req.id));
      setActiveTrip(accepted);
      setIsAvailable(false);
      setDeliveries((ds) => [
        normalizeDelivery(accepted),
        ...ds,
      ]);
      fetchDeliveryHistory();
      setLocationFor(null);
      setActiveTab("history");
      showToast(`Trip ${req.bookingId || req.id} accepted — location shared`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not accept trip.", "danger");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(
        `/booking/driver/requests/${id}/reject`,
        {},
        { headers: driverAuthHeaders() }
      );
      setRequests((rs) => rs.filter((r) => r.id !== id));
      showToast("Trip request declined.", "danger");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not reject trip.", "danger");
    }
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
        isAvailable={isAvailable}
        onAvailabilityToggle={handleAvailabilityToggle}
      />

      {showRouteMap && activeTrip ? (
        <DriverRouteMap
          booking={activeTrip}
          driverPosition={
            activeTrip.lastLat && activeTrip.lastLng
              ? [activeTrip.lastLat, activeTrip.lastLng]
              : null
          }
          onBack={() => setShowRouteMap(false)}
        />
      ) : (
        <>
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
                activeTrip={activeTrip}
                onOpenRouteMap={() => setShowRouteMap(true)}
                onConfirmPickup={() => confirmTripMilestone("pickup")}
                onConfirmDelivered={() => confirmTripMilestone("delivered")}
              />
            )}

          </div>
        </>
      )}
    </div>
  );
}
