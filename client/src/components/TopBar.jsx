// components/TopBar.jsx

export default function TopBar({ setSidebarOpen, activeSection, user, t }) {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "customer", label: "Customer" },
    { id: "vehicle", label: "Vehicle" },
    { id: "booking", label: "Booking" },
  ];

  const currentTitle = sidebarItems.find(s => s.id === activeSection)?.label || "Dashboard";

  return (
    <div 
      className="topbar" 
      style={{ 
        background: t.surface, 
        borderBottom: `1px solid ${t.border}` 
      }}
    >
      {/* Menu Button */}
      <button 
        onClick={() => setSidebarOpen(true)} 
        className="topbar-menu-btn"
        style={{ color: t.text }}
      >
        ☰
      </button>

      {/* Title */}
      <h1 
        className="topbar-title" 
        style={{ color: t.text }}
      >
        {currentTitle}
      </h1>

      {/* User Info */}
      <div 
        className="topbar-user-info" 
        style={{ color: t.textMuted }}
      >
        Logged in as{" "}
        <span 
          className="topbar-user-name" 
          style={{ color: t.accent }}
        >
          {user?.name}
        </span>
      </div>
    </div>
  );
}