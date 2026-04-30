import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Dashboard from "../pages/Dashboard";
import CustomerSection from "../pages/Customer";
import VehicleSection from "../pages/Vehicle";
import BookingSection from "../pages/Booking";
import TrackingPage from "../pages/TrackingPage";
import VehicleMapPage from "../pages/VehicleMapPage";
import Modal from "./Modal";
import BookingCreatePage from "../pages/BookingCreatePage"; 

import { useDispatch } from "react-redux";
import { createCustomer, updateCustomer } from "../../redux/features/customer/customerActions";
import toast from "react-hot-toast";

export default function MainApp(props) {
  const {
    darkMode,
    setDarkMode,
    user,
    activeSection,
    setActiveSection,
    customers,
    vehicles,
    bookings,
    setTrackingBooking,
    setPage,
    t
  } = props;

  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [page, setLocalPage] = useState("app"); // 🔥 internal page control

  const [trackingVehicle, setTrackingVehicle] = useState(null);

  // ---------------- MODAL ----------------
  const openModal = (type, data = null) => {
    setForm(data || {});
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  // ---------------- CUSTOMER SUBMIT ----------------
  const handleCustomerSubmit = async (form) => {
    try {
      let res;

      if (form.id) {
        res = await dispatch(updateCustomer({ id: form.id, data: form }));
      } else {
        res = await dispatch(createCustomer(form));
      }

      if (res.meta.requestStatus === "fulfilled") {
        toast.success(form.id ? "Customer updated!" : "Customer created!");
        closeModal();
      } else {
        toast.error(res.payload || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ---------------- PAGE SWITCH ----------------
  if (page === "tracking") {
    return (
      <TrackingPage
        bookingId={trackingVehicle}
        setPage={setLocalPage}
        t={t}
      />
    );
  }

  if (page === "vehicle-map") {
    return (
      <VehicleMapPage
        vehicle={trackingVehicle}
        setPage={setLocalPage}
        t={t}
      />
    );
  }

  if (page === "booking-create") {
    return (
      <BookingCreatePage
        customers={customers}
        vehicles={vehicles}
        setPage={setLocalPage}
        createBooking={(data) => {
          console.log("CREATE BOOKING:", data);
          // 👉 you can connect API later
        }}
        t={t}
      />
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div style={{ minHeight: "100vh", background: t.bg }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        t={t}
      />

      <TopBar
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        user={user}
        t={t}
      />

      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
        
        {activeSection === "dashboard" && (
          <Dashboard
            setTrackingBooking={(id) => {
              setTrackingVehicle(id);
              setLocalPage("tracking");
            }}
            setPage={setLocalPage}
            t={t}
          />
        )}

        {activeSection === "customer" && (
          <CustomerSection
            customers={customers}
            openModal={openModal}
            t={t}
          />
        )}

        {activeSection === "vehicle" && (
          <VehicleSection
            vehicles={vehicles}
            openModal={openModal}
            setTrackingVehicle={(v) => {
              setTrackingVehicle(v);
              setLocalPage("vehicle-map");
            }}
            setPage={setLocalPage}
            t={t}
          />
        )}

        {activeSection === "booking" && (
          <BookingSection
            openModal={openModal}
            setTrackingBooking={(id) => {
              setTrackingVehicle(id);
              setLocalPage("tracking");
            }}
            setPage={setLocalPage}
            t={t}
          />
        )}
      </div>

      <Modal
        modal={modal}
        form={form}
        setForm={setForm}
        closeModal={closeModal}
        handleCustomerSubmit={handleCustomerSubmit}
        customers={customers}
        vehicles={vehicles}
        t={t}
      />
    </div>
  );
}
