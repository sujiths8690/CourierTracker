// ─── CourierFlow Driver Portal — Helpers & Icons ─────────────────────────────

/** Maps a delivery/request status string → CSS modifier class name */
export function pillClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "delivered";
  if (s === "transit")   return "transit";
  if (s === "accepted")  return "accepted";
  if (s === "rejected")  return "rejected";
  return "pending";
}

/** Extracts up to two initials from a full name */
export function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Shared SVG icon library ──────────────────────────────────────────────────
// All icons are inline SVG so there are zero external icon-font dependencies.

export const Icon = {
  truck: (color = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="15" height="9" rx="1" />
      <path d="M16 13h5l1 5H16z" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="18.5" cy="18" r="2" />
      <path d="M1 9V6a1 1 0 011-1h10l4 4" />
    </svg>
  ),

  check: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  x: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" />
    </svg>
  ),

  location: (color = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),

  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.41 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  ),

  history: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  ),

  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),

  moon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),

  sun: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  ),

  spinnerSvg: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ animation: "dp-spin 1s linear infinite" }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M8 2a6 6 0 016 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),

  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  alert: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 4.5v3.5M7.5 10.5h.01" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
    </svg>
  ),
};