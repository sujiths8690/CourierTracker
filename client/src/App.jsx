// App.jsx
import { useState, useEffect } from "react";
import theme from "./theme/theme";
import { mockCustomers, mockVehicles, mockBookings } from "./data/mockData";
import { useSelector } from "react-redux";
import { selectAuthUser } from "./redux/features/auth/authSelector";
import "leaflet/dist/leaflet.css";

import AuthPage from "./userSide/pages/AuthPage";
import TrackingPage from "./userSide/pages/TrackingPage";
import MainApp from "./userSide/components/MainApp";
import DriverPortal from "./DriverPortal/DriverPortal";
import { selectAuthToken } from "./redux/features/auth/authSelector";

export default function App() {
  const isDriverRoute = window.location.pathname === "/driver";
  const [darkMode, setDarkMode] = useState(false);
  const token = useSelector(selectAuthToken);
  const [page, setPage] = useState("dashboard");
  
  const user = useSelector(selectAuthUser);

  const [customers, setCustomers] = useState(mockCustomers);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [bookings, setBookings] = useState(mockBookings);

  const [trackingBooking, setTrackingBooking] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const t = darkMode ? theme.dark : theme.light;

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Sora', sans-serif; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }
      input, textarea, select { font-family: 'Sora', sans-serif; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (isDriverRoute) {
    return <DriverPortal />;
  }

  // Shared CRUD handlers
  const saveCustomer = (newCustomer) => {
    setCustomers((cs) =>
      newCustomer.id
        ? cs.map((c) => (c.id === newCustomer.id ? newCustomer : c))
        : [...cs, { ...newCustomer, id: Date.now() }]
    );
  };

  const deleteCustomer = (id) => setCustomers((cs) => cs.filter((c) => c.id !== id));

  const saveVehicle = (newVehicle) => {
    setVehicles((vs) =>
      newVehicle.id
        ? vs.map((v) => (v.id === newVehicle.id ? newVehicle : v))
        : [...vs, { ...newVehicle, id: Date.now() }]
    );
  };

  const deleteVehicle = (id) => setVehicles((vs) => vs.filter((v) => v.id !== id));

  const createBooking = (newBooking) => {
    setBookings((bs) => [
      ...bs,
      {
        ...newBooking,
        id: `BK-${String(Date.now()).slice(-3)}`,
        status: "Pending",
        progress: 0,
      },
    ]);
  };

  if (!token) {
    return (
      <AuthPage
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        t={t}
        setPage={setPage}
      />
    );
  }

  if (page === "tracking" && trackingBooking) {
    return (
      <TrackingPage
        booking={trackingBooking}
        setPage={setPage}
        t={t}
      />
    );
  }

  return (
    <MainApp
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      user={user} 
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      customers={customers}
      vehicles={vehicles}
      bookings={bookings}
      saveCustomer={saveCustomer}
      deleteCustomer={deleteCustomer}
      saveVehicle={saveVehicle}
      deleteVehicle={deleteVehicle}
      createBooking={createBooking}
      setTrackingBooking={setTrackingBooking}
      setPage={setPage}
      t={t}
    />
  );
}
