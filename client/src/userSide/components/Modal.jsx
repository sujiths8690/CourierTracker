import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import MapSection from "./MapSection";
import SearchBox from "./SearchBox";

import {
  createVehicle,
  updateVehicle,
  fetchVehicles
} from "../../redux/features/vehicle/vehicleActions";

export default function Modal({
  modal,
  form,
  setForm,
  handleCustomerSubmit,
  closeModal,
  createBooking,
  customers,
  vehicles,
  t
}) {
  const dispatch = useDispatch();

  const [currentPos, setCurrentPos] = useState([10, 76]);

  // 📍 Get user location
  useEffect(() => {
    if (!modal?.includes("customer")) return; // ✅ STOP for vehicle

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCurrentPos([lat, lng]);

        setForm((prev) => ({
          ...prev,
          lat,
          lng,
        }));
      },
      () => {}
    );
  }, [modal]);

  if (!modal) return null;

  // 🎨 styles
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.inputBg,
    color: t.text,
    fontSize: 14,
  };

  const btnPrimary = {
    background: t.accent,
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 12,
    width: "100%",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: t.overlay,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: t.surface,
          borderRadius: 20,
          padding: "2rem",
          width: "100%",
          maxWidth: 440,
          border: `1px solid ${t.border}`,
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {modal.includes("customer") && (modal === "customer-add" ? "Add Customer" : "Edit Customer")}
            {modal.includes("vehicle") && (modal === "vehicle-add" ? "Add Vehicle" : "Edit Vehicle")}
            {modal === "booking-add" && "Create Booking"}
          </h3>

          <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 24 }}>
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ================= CUSTOMER ================= */}
          {(modal === "customer-add" || modal === "customer-edit") && (
            <>
              <input
                placeholder="Full Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />

              <div
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.inputBg,
                  color: form.address ? t.text : t.textMuted,
                  fontSize: 14,
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {form.address || "Select location from map or search"}
              </div>

              {/* 🔍 SEARCH */}
              <SearchBox
                onSelect={(place) => {
                  setForm((prev) => ({
                    ...prev,
                    address: place.name,
                    lat: Number(place.lat),
                    lng: Number(place.lng),
                  }));
                }}
              />

              {/* 🗺 MAP */}
              <div style={{ height: 250 }}>
                <MapSection
                  key={form.lat + "-" + form.lng}
                  pos={form.lat ? [form.lat, form.lng] : currentPos}
                  clickable={true}
                  onSelect={(place) => {
                    setForm((prev) => ({
                      ...prev,
                      address: place.name,
                      lat: place.lat,
                      lng: place.lng,
                    }));
                  }}
                />
              </div>

              <button
                onClick={() => handleCustomerSubmit(form)}
                style={btnPrimary}
              >
                Save Customer
              </button>
            </>
          )}

          {/* ================= VEHICLE ================= */}
          {(modal === "vehicle-add" || modal === "vehicle-edit") && (
            <>
              <input
                placeholder="Vehicle Number"
                value={form.number || ""}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                style={inputStyle}
              />

              <select
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Type</option>
                <option value="TRUCK">Truck</option>
                <option value="PICKUP">Pickup</option>
              </select>

              <input
                placeholder="Owner Name"
                value={form.ownerName || ""}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                style={inputStyle}
              />

              <input
                placeholder="Owner Mobile"
                value={form.ownerMobile || ""}
                onChange={(e) => setForm({ ...form, ownerMobile: e.target.value })}
                style={inputStyle}
              />

              {modal === "vehicle-add" && (
                <input
                  placeholder="Owner Password"
                  type="password"
                  value={form.ownerPassword || ""}
                  onChange={(e) =>
                    setForm({ ...form, ownerPassword: e.target.value })
                  }
                  style={inputStyle}
                />
              )}

              {/* 💰 PRICE */}
              <input
                placeholder="Price per KM"
                type="number"
                value={form.price || ""}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                style={inputStyle}
              />

              <select
                value={form.status || ""}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
              </select>

              <button
                onClick={async () => {
                  if (modal === "vehicle-add") {
                    await dispatch(createVehicle({
                      number: form.number,
                      type: form.type,
                      pricePerKm: form.price,
                      ownerName: form.ownerName,
                      ownerMobile: form.ownerMobile,
                      ownerPassword: form.ownerPassword
                    }));

                    await dispatch(fetchVehicles());

                  } else {
                    await dispatch(updateVehicle({
                      id: form.id,
                      data: {
                        number: form.number,
                        type: form.type,
                        status: form.status,
                        pricePerKm: form.price,
                        ownerName: form.ownerName,
                        ownerMobile: form.ownerMobile
                      }
                    }));
                  }

                  closeModal();
                }}
                style={btnPrimary}
              >
                Save Vehicle
              </button>
            </>
          )}

          {/* ================= BOOKING ================= */}
          {modal === "booking-add" && (
            <>
              <select
                value={form.vehicleId || ""}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.number}
                  </option>
                ))}
              </select>

              <select
                value={form.customerId || ""}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Pickup Address"
                value={form.pickupAddress || ""}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                style={inputStyle}
              />

              <button
                onClick={() => {
                  createBooking(form);
                  closeModal();
                }}
                style={btnPrimary}
              >
                Create Booking
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
