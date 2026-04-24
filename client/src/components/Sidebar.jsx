// components/Sidebar.jsx

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  setActiveSection,
  user,
  darkMode,
  setDarkMode,
  setPage,
  t
}) {
  const sidebarItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "customer", icon: "◎", label: "Customer" },
    { id: "vehicle", icon: "▷", label: "Vehicle" },
    { id: "booking", icon: "◈", label: "Booking" },
  ];

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ background: t.overlay }}
        />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          background: t.sidebarBg,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <h2 
            className="sidebar-logo" 
            style={{ color: t.sidebarText }}
          >
            CourierFlow
          </h2>

          <div className="sidebar-user-card">
            <div 
              className="sidebar-avatar" 
              style={{ background: t.sidebarActive }}
            >
              {user?.name?.[0] ?? "U"}
            </div>
            <div 
              className="sidebar-user-name" 
              style={{ color: t.sidebarText }}
            >
              {user?.name}
            </div>
            <div 
              className="sidebar-user-email" 
              style={{ color: t.sidebarMuted }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sidebarItems.map(({ id, icon, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveSection(id);
                  setSidebarOpen(false);
                }}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                style={{
                  background: isActive ? `${t.sidebarActive}22` : "transparent",
                  color: isActive ? t.sidebarActive : t.sidebarMuted,
                  borderLeft: isActive ? `3px solid ${t.sidebarActive}` : "none",
                }}
              >
                <span className="sidebar-item-icon">{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-bottom">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="sidebar-bottom-btn"
            style={{ 
              borderColor: "rgba(255,255,255,0.1)", 
              color: t.sidebarMuted 
            }}
          >
            {darkMode ? "☀ Light Mode" : "⬤ Dark Mode"}
          </button>

          <button
            onClick={() => setPage("auth")}
            className="sidebar-bottom-btn"
            style={{ 
              borderColor: "rgba(255,255,255,0.1)", 
              color: "red" 
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}