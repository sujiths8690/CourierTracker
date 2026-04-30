// ─── DriverPortal.jsx ─────────────────────────────────────────────────────────
// Root entry point for the Driver Portal.
// Manages auth state (logged-in driver) and dark mode, then renders either
// AuthPage or Dashboard accordingly.
//
// Usage — drop into your router:
//   import DriverPortal from "./driver-portal/DriverPortal";
//   <Route path="/driver" element={<DriverPortal />} />

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../DriverPortal.css";   // ← one level up from this folder; adjust path if needed
import AuthPage  from "./AuthPage";
import Dashboard from "./Dashboard";
import { logoutDriver } from "../redux/features/driverSide/auth/authActions";
import { selectDriver } from "../redux/features/driverSide/auth/authSelector";

export default function DriverPortal() {
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();
  const driver = useSelector(selectDriver);

  const handleLogout = () => {
    dispatch(logoutDriver());
  };

  if (!driver) {
    return (
      <AuthPage
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <Dashboard
      driver={driver}
      onLogout={handleLogout}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}
