// ─── DriverPortal.jsx ─────────────────────────────────────────────────────────
// Root entry point for the Driver Portal.
// Manages auth state (logged-in driver) and dark mode, then renders either
// AuthPage or Dashboard accordingly.
//
// Usage — drop into your router:
//   import DriverPortal from "./driver-portal/DriverPortal";
//   <Route path="/driver" element={<DriverPortal />} />

import { useState } from "react";
import "../DriverPortal.css";   // ← one level up from this folder; adjust path if needed
import AuthPage  from "./AuthPage";
import Dashboard from "./Dashboard";

export default function DriverPortal() {
  const [darkMode, setDarkMode] = useState(false);
  const [driver,   setDriver]   = useState(null);

  const handleLogin  = (d) => setDriver(d);
  const handleLogout = ()  => setDriver(null);

  if (!driver) {
    return (
      <AuthPage
        onLogin={handleLogin}
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