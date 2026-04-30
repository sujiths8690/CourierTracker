// ─── Toast.jsx ────────────────────────────────────────────────────────────────
// Self-dismissing notification that appears at the bottom of the screen.
//
// Props:
//   message  string   – text to display
//   type     string   – "success" | "danger" | "info"
//   onDone   fn       – called after auto-dismiss (3.2 s)

import { useEffect } from "react";

export default function Toast({ message, type = "info", onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  const icon = {
    success: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7l3.5 3.5 6.5-7"
          stroke="var(--dp-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    danger: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2l10 10M12 2L2 12"
          stroke="var(--dp-danger)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    info: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="var(--dp-info)" strokeWidth="1.5" />
        <path d="M7 6v4M7 4.5h.01" stroke="var(--dp-info)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  }[type];

  return (
    <div className={`dp-toast ${type}`}>
      {icon}
      {message}
    </div>
  );
}