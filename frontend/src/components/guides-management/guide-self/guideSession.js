/**
 * Guide self-service session — align with user-management login when you merge auth.
 *
 * After a successful guide login, call:
 *   import { setGuideSessionAfterLogin, GUIDE_SELF_DASHBOARD_PATH } from "./guideSession";
 *   setGuideSessionAfterLogin({ guideId: "<Mongo Guide _id>" });
 *   navigate(GUIDE_SELF_DASHBOARD_PATH);
 *
 * Expected storage (any of these for guide id):
 *   - currentGuideId (preferred)
 *   - loggedInGuideId, guideId
 *   - auth_session JSON: { guideId | linkedGuideId | guide_id, role?: "guide", ... }
 *
 * Role: localStorage "role" or "userRole", or auth_session.role / userRole (case-insensitive "guide").
 *
 * Local dev without auth UI: set in frontend/.env:
 *   REACT_APP_GUIDE_SELF_DEV_BYPASS=true
 *   REACT_APP_JAYANTHA_GUIDE_ID=<Jayantha's MongoDB _id>   (team default guide)
 *   REACT_APP_GUIDE_DEV_ID=<id>                             (optional override)
 * Guide self-dashboard URL: /guides/owndashboard (navigate there explicitly or after login).
 */
import axios from "axios";

export const GUIDE_SELF_DASHBOARD_PATH = "/guides/ownprofile";

/** Cleared on guide sign-out — keep in sync with user-management logout if auth is shared */
export const GUIDE_SESSION_STORAGE_KEYS = [
  "auth_session",
  "role",
  "userRole",
  "guideId",
  "loggedInGuideId",
  "currentGuideId",
];

function readGuideIdFromAuthSession() {
  try {
    const raw = localStorage.getItem("auth_session");
    if (!raw) return null;
    const p = JSON.parse(raw);
    const id = p.guideId ?? p.linkedGuideId ?? p.guide_id ?? null;
    return id != null ? String(id).trim() : null;
  } catch {
    return null;
  }
}

function notifyGuideSessionChanged() {
  try {
    window.dispatchEvent(new CustomEvent("guide-session-changed"));
  } catch {
    try {
      window.dispatchEvent(new Event("guide-session-changed"));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Call from user-management after guide login. Optionally merge fields into auth_session.
 * @param {{ guideId: string, role?: string, authSessionPatch?: Record<string, unknown> }} params
 */
const API_URL = "http://localhost:5000";

export async function syncGuideSession(token) {
  try {
    const res = await axios.get(`${API_URL}/api/guides/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data._id) {
      setGuideSessionAfterLogin({ guideId: res.data._id });
      return res.data._id;
    }
  } catch (err) {
    console.error("Failed to sync guide session:", err);
  }
  return null;
}

export function setGuideSessionAfterLogin({ guideId, role = "guide", authSessionPatch }) {
  if (guideId == null || String(guideId).trim() === "") return;
  const id = String(guideId).trim();
  localStorage.setItem("currentGuideId", id);
  localStorage.setItem("guideId", id);
  localStorage.setItem("role", role);

  if (authSessionPatch && typeof authSessionPatch === "object") {
    try {
      const raw = localStorage.getItem("auth_session");
      const base = raw ? JSON.parse(raw) : {};
      const next = {
        ...base,
        ...authSessionPatch,
        role: authSessionPatch.role ?? role,
        guideId: id,
      };
      localStorage.setItem("auth_session", JSON.stringify(next));
    } catch {
      localStorage.setItem(
        "auth_session",
        JSON.stringify({ role, guideId: id, ...authSessionPatch })
      );
    }
  } else {
    try {
      const raw = localStorage.getItem("auth_session");
      const base = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "auth_session",
        JSON.stringify({ ...base, role, guideId: id })
      );
    } catch {
      localStorage.setItem("auth_session", JSON.stringify({ role, guideId: id }));
    }
  }
  notifyGuideSessionChanged();
}

export function clearGuideSession() {
  GUIDE_SESSION_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  notifyGuideSessionChanged();
}

/**
 * On first load in dev: persist Jayantha (or GUIDE_DEV_ID) as the logged-in guide so dashboard/bookings use that account.
 * Safe to call from index.js; no-op if bypass is off or id missing or session already set.
 */
export function seedJayanthaDevSessionIfNeeded() {
  if (typeof window === "undefined") return;
  if (process.env.REACT_APP_GUIDE_SELF_DEV_BYPASS !== "true") return;
  const id =
    (process.env.REACT_APP_GUIDE_DEV_ID && String(process.env.REACT_APP_GUIDE_DEV_ID).trim()) ||
    (process.env.REACT_APP_JAYANTHA_GUIDE_ID && String(process.env.REACT_APP_JAYANTHA_GUIDE_ID).trim()) ||
    "";
  if (!id) return;
  if (localStorage.getItem("currentGuideId")) return;
  setGuideSessionAfterLogin({ guideId: id, role: "guide" });
}

export function getCurrentGuideId() {
  const fromLs =
    localStorage.getItem("currentGuideId") ||
    localStorage.getItem("loggedInGuideId") ||
    localStorage.getItem("guideId");
  if (fromLs && String(fromLs).trim()) return String(fromLs).trim();

  const fromAuth = readGuideIdFromAuthSession();
  if (fromAuth) return fromAuth;

  if (process.env.REACT_APP_GUIDE_SELF_DEV_BYPASS === "true") {
    const dev =
      (process.env.REACT_APP_GUIDE_DEV_ID && String(process.env.REACT_APP_GUIDE_DEV_ID).trim()) ||
      (process.env.REACT_APP_JAYANTHA_GUIDE_ID && String(process.env.REACT_APP_JAYANTHA_GUIDE_ID).trim()) ||
      "";
    if (dev) return dev;
  }

  return null;
}

function isGuideRole(role) {
  if (role == null) return false;
  const r = String(role).toLowerCase().trim();
  return r === "guide" || r === "field_guide" || r === "tour_guide";
}

export function getCurrentRole() {
  try {
    const directRole = localStorage.getItem("role") || localStorage.getItem("userRole");
    if (directRole) return directRole;
    const raw = localStorage.getItem("auth_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.role ?? parsed?.userRole ?? null;
  } catch {
    return null;
  }
}

/**
 * True when the user is a guide and a guide id is available.
 * Dev: set REACT_APP_GUIDE_SELF_DEV_BYPASS=true and REACT_APP_GUIDE_DEV_ID to preview without login.
 */
export function isLoggedInAsGuide() {
  if (process.env.REACT_APP_GUIDE_SELF_DEV_BYPASS === "true") {
    return Boolean(getCurrentGuideId());
  }
  if (!isGuideRole(getCurrentRole())) return false;
  return Boolean(getCurrentGuideId());
}
