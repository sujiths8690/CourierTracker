import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteVehicle, fetchVehicles } from "../redux/features/vehicle/vehicleActions";

import truckImg from "../assets/truck.png";
import pickupImg from "../assets/pickup.png";

export default function VehicleSection({
  openModal,
  setTrackingVehicle,
  setPage,
  t
}) {
  const dispatch = useDispatch();

  const vehicles = useSelector((state) => state.vehicle.vehicles);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // 🎨 Status color
  const statusColor = (s) => {
    const l = s?.toLowerCase() || "";
    if (l.includes("available")) return { bg: "#d4edda", color: "#155724" };
    if (l.includes("busy")) return { bg: "#fff3cd", color: "#856404" };
    return { bg: "#f8f9fa", color: "#6c757d" };
  };

  // 🚗 Vehicle Image
  const getVehicleImage = (type) => {
    if (type === "TRUCK") return truckImg;
    if (type === "PICKUP") return pickupImg;
    return null;
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1.25rem"
      }}>
        <p style={{ color: t.textMuted }}>
          {vehicles.length} vehicles in fleet
        </p>

        <button
          onClick={() => openModal("vehicle-add")}
          style={{
            background: t.accent,
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 10,
            cursor: "pointer"
          }}
        >
          + Add Vehicle
        </button>
      </div>

      {/* LIST */}
      {vehicles.map((v) => {
        const sc = statusColor(v.status);

        return (
          <div
            key={v.id}
            style={{
              background: t.surface,
              borderRadius: 16,
              padding: "1.25rem",
              border: `1px solid ${t.border}`,
              marginBottom: 12
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10
            }}>

              {/* LEFT: IMAGE + INFO */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                
                <img
                  src={getVehicleImage(v.type)}
                  alt={v.type}
                  style={{ width: 90, height: 90, objectFit: "contain" }}
                />

                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {v.number}
                  </div>

                  <div style={{ color: t.textMuted, fontSize: 13 }}>
                    {v.type} · {v.owner}
                  </div>

                  {/* 📍 LOCATION BUTTON */}
                  <button
                    onClick={() => {
                      setTrackingVehicle(v);
                      setPage("vehicle-map");
                    }}
                    style={{
                      marginTop: 8,
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      border: `1px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.text,
                      cursor: "pointer"
                    }}
                  >
                    📍 View Location
                  </button>
                </div>
              </div>

              {/* CENTER: PRICE */}
              <div style={{
                textAlign: "center",
                minWidth: 120
              }}>
                <div style={{
                  fontSize: 12,
                  color: t.textMuted
                }}>
                  Price
                </div>

                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: t.accent
                }}>
                  ₹{v.pricePerKm ?? "--"}
                </div>

                <div style={{
                  fontSize: 11,
                  color: t.textMuted
                }}>
                  per km
                </div>
              </div>

              {/* RIGHT: ACTIONS */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                
                {/* STATUS */}
                <span style={{
                  background: sc.bg,
                  color: sc.color,
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {v.status}
                </span>

                {/* EDIT */}
                <button
                  onClick={() =>
                    openModal("vehicle-edit", {
                      ...v,
                      price: v.pricePerKm,
                      ownerName: v.owner,
                      ownerMobile: v.ownerMobile 
                    })
                  }
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>

                {/* DELETE */}
                <button
                  onClick={() => dispatch(deleteVehicle(v.id))}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    color: "red",
                    border: `1px solid red`,
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}