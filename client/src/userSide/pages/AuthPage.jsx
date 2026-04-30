import { useDispatch } from "react-redux";
import BoxStack from "../components/BoxStack";
import { useState } from "react";
import { loginUser, registerUser } from "../../redux/features/userSide/auth/authActions";
import { loginSchema, registerSchema } from "../../validation/auth/authValidation";
import { toast } from "react-hot-toast";

export default function AuthPage({ darkMode, setDarkMode, t, setPage }) {
  const dispatch = useDispatch();

  const [authMode, setAuthMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    console.log("🔥 CLICKED LOGIN");

    try {
      const schema = authMode === "login" ? loginSchema : registerSchema;

      await schema.validate(form, { abortEarly: false });

      const action =
        authMode === "login"
          ? loginUser({
              email: form.email,
              password: form.password,
            })
          : registerUser(form);

      // 🔥 THIS FIXES EVERYTHING
      const res = await dispatch(action).unwrap();

      toast.success(
        authMode === "login"
          ? "Login successful"
          : "Account created"
      );

      // ✅ reset form
      setForm({
        name: "",
        email: "",
        password: "",
      });

      setPage("dashboard");

    } catch (error) {
      console.error("❌ ERROR:", error);

      if (error.inner) {
        error.inner.forEach((e) => toast.error(e.message));
      } else {
        toast.error(error || "Something went wrong");
      }
    }
  };

  return (
    <div className="auth-page" style={{ background: t.bg }}>
      <div className="auth-container">
        <div className="auth-header">
          <BoxStack t={t} />
          <h1 className="auth-title" style={{ color: t.text }}>
            CourierFlow
          </h1>
          <p className="auth-subtitle" style={{ color: t.textMuted }}>
            Intelligent logistics, simplified.
          </p>
        </div>

        <div
          className="auth-card"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadow,
          }}
        >
          <div className="auth-toggle" style={{ background: t.surfaceAlt }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setAuthMode(m)}
                className={`auth-toggle-btn ${authMode === m ? "active" : ""}`}
                style={{
                  background: authMode === m ? t.surface : "transparent",
                  color: authMode === m ? t.text : t.textMuted,
                }}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div className="auth-form">
            {authMode === "register" && (
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="auth-input"
                style={{
                  border: `1px solid ${t.border}`,
                  background: t.inputBg,
                  color: t.text,
                }}
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="auth-input"
              style={{
                border: `1px solid ${t.border}`,
                background: t.inputBg,
                color: t.text,
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="auth-input"
              style={{
                border: `1px solid ${t.border}`,
                background: t.inputBg,
                color: t.text,
              }}
            />

            <button
              onClick={handleSubmit}
              className="auth-primary-btn"
              style={{ background: t.accent }}
            >
              {authMode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="auth-secondary-btn"
          style={{
            border: `1px solid ${t.border}`,
            color: t.text,
          }}
        >
          {darkMode ? "☀ Light Mode" : "⬤ Dark Mode"}
        </button>
      </div>
    </div>
  );
}
