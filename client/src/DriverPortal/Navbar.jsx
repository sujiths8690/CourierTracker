// ─── Navbar.jsx ───────────────────────────────────────────────────────────────
// Sticky top navigation bar for the driver dashboard.
// Shows branding, driver chip, online status badge, and action buttons.
//
// Props:
//   driver       object   – logged-in driver { name, phone }
//   darkMode     boolean
//   setDarkMode  fn
//   onLogout     fn

import { initials, Icon } from "./Helpers";

export default function Navbar({ driver, darkMode, setDarkMode, onLogout }) {
  return (
    <nav className="dp-navbar">

      {/* Brand */}
      <span className="dp-navbar-brand">
        Courier<span>Flow</span>
      </span>

      <div className="dp-navbar-divider" />

      {/* Driver identity chip */}
      <div className="dp-driver-chip">
        <div className="dp-driver-avatar">{initials(driver.name)}</div>
        <div>
          <div className="dp-driver-chip-name">{driver.name}</div>
          <div className="dp-driver-chip-phone">+91 {driver.phone}</div>
        </div>
      </div>

      {/* Online status */}
      <div className="dp-online-badge">
        <div className="dp-online-dot" />
        Online
      </div>

      {/* Right-side actions */}
      <div className="dp-navbar-right">
        <button
          className="dp-icon-btn"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? Icon.sun : Icon.moon}
        </button>

        <button className="dp-icon-btn" title="Sign out" onClick={onLogout}>
          {Icon.logout}
        </button>
      </div>

    </nav>
  );
}