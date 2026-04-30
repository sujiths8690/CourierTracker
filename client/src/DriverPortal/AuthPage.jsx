// ─── AuthPage.jsx ─────────────────────────────────────────────────────────────
// Driver login page — split layout with a dark hero panel on the left and a
// clean form on the right. Authenticates VehicleUser drivers through Redux.
//
// Props:
//   darkMode     boolean
//   setDarkMode  fn

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useThemeVars } from "./Hooks";
import { theme } from "./Theme";
import { Icon } from "./Helpers";
import { loginDriver } from "../redux/features/driverSide/auth/authActions";
import {
  clearDriverAuthError,
} from "../redux/features/driverSide/auth/authSlice";
import {
  selectDriverAuthError,
  selectDriverAuthLoading,
} from "../redux/features/driverSide/auth/authSelector";

export default function AuthPage({ darkMode, setDarkMode }) {
  const dispatch = useDispatch();
  const authLoading = useSelector(selectDriverAuthLoading);
  const authError = useSelector(selectDriverAuthError);
  const [rootEl,   setRootEl]   = useState(null);
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const t = darkMode ? theme.dark : theme.light;
  useThemeVars(rootEl, t);

  useEffect(() => {
    setError(authError || "");
  }, [authError]);

  const handleLogin = () => {
    setError("");
    dispatch(clearDriverAuthError());

    if (!phone || !password) {
      setError("Please enter your mobile number and password.");
      return;
    }

    dispatch(loginDriver({
      mobileNumber: phone,
      password
    }));
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="dp-auth-root" ref={setRootEl}>

      {/* ── Left hero panel ──────────────────────────────────────── */}
      <div className="dp-auth-hero">
        <div className="dp-hero-badge">
          {Icon.truck(t.accent)}
          <span>Driver Portal</span>
        </div>

        <h1 className="dp-hero-title">
          Your route.<br />Your earnings.<br />Your schedule.
        </h1>

        <p className="dp-hero-desc">
          Accept trips, track deliveries, and manage your on-road life —
          all from one place built for drivers first.
        </p>

        <div className="dp-hero-stats">
          {[
            { val: "142",   label: "Trips completed" },
            { val: "₹1.2L", label: "Lifetime earnings" },
            { val: "4.8",   label: "Driver rating" },
            { val: "98%",   label: "On-time rate" },
          ].map(({ val, label }) => (
            <div key={label} className="dp-hero-stat">
              <div className="dp-hero-stat-val">{val}</div>
              <div className="dp-hero-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="dp-auth-form-panel">
        <div className="dp-auth-brand">
          Courier<span>Flow</span>
        </div>

        <h2 className="dp-auth-heading">Welcome back, driver</h2>
        <p className="dp-auth-subheading">
          Sign in with your registered mobile number
        </p>

        {/* Error message */}
        {error && (
          <div className="dp-auth-error">
            {Icon.alert}
            {error}
          </div>
        )}

        {/* Mobile number */}
        <div className="dp-form-group">
          <label className="dp-form-label">Mobile Number</label>
          <div className="dp-input-wrap">
            <span className="dp-input-prefix">+91</span>
            <input
              className="dp-input has-prefix"
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKey}
            />
          </div>
        </div>

        {/* Password */}
        <div className="dp-form-group">
          <label className="dp-form-label">Password</label>
          <div className="dp-input-wrap">
            <input
              className="dp-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          className="dp-submit-btn"
          onClick={handleLogin}
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              {Icon.spinnerSvg}
              Signing in…
            </>
          ) : (
            <>
              Sign In
              {Icon.arrowRight}
            </>
          )}
        </button>

        {/* Theme toggle */}
        <button
          className="dp-theme-toggle"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? Icon.sun : Icon.moon}
          &nbsp;{darkMode ? "Light mode" : "Dark mode"}
        </button>
      </div>

    </div>
  );
}
