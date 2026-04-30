// ─── CourierFlow Driver Portal — Shared Hooks ─────────────────────────────────

import { useEffect } from "react";

/**
 * useThemeVars
 * Writes theme token values as CSS custom properties directly onto a DOM
 * element so that DriverPortal.css can reference var(--dp-*) in all components.
 *
 * Usage:
 *   const [rootEl, setRootEl] = useState(null);
 *   useThemeVars(rootEl, t);
 *   return <div ref={setRootEl} className="dp-root"> … </div>;
 */
export function useThemeVars(el, t) {
  useEffect(() => {
    if (!el || !t) return;
    const map = {
      "--dp-bg":            t.bg,
      "--dp-surface":       t.surface,
      "--dp-surface-alt":   t.surfaceAlt,
      "--dp-border":        t.border,
      "--dp-text":          t.text,
      "--dp-text-muted":    t.textMuted,
      "--dp-accent":        t.accent,
      "--dp-accent-light":  t.accentLight,
      "--dp-sidebar-bg":    t.sidebarBg,
      "--dp-sidebar-text":  t.sidebarText,
      "--dp-sidebar-muted": t.sidebarMuted,
      "--dp-input-bg":      t.inputBg,
      "--dp-shadow":        t.shadow,
      "--dp-overlay":       t.overlay,
      "--dp-success":       t.success,
      "--dp-success-bg":    t.successBg,
      "--dp-warning":       t.warning,
      "--dp-warning-bg":    t.warningBg,
      "--dp-danger":        t.danger,
      "--dp-danger-bg":     t.dangerBg,
      "--dp-info":          t.info,
      "--dp-info-bg":       t.infoBg,
    };
    Object.entries(map).forEach(([k, v]) => el.style.setProperty(k, v));
  }, [el, t]);
}