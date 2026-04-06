/**
 * Turn stored paths from the API (/uploads/...) into a full URL for <img src>.
 * Leaves http(s) and data URLs unchanged.
 */
export function resolveMediaUrl(stored) {
  if (stored == null || typeof stored !== "string") return null;
  const s = stored.trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  const base = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");
  return `${base}${s.startsWith("/") ? s : `/${s}`}`;
}
