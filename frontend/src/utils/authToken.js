/**
 * Resolve JWT from userInfo / legacy localStorage keys.
 * Strips accidental "Bearer " prefix and whitespace.
 */
export function normalizeAuthToken(raw) {
  if (raw == null || raw === "") return null;
  let t = String(raw).trim();
  if (!t || t === "undefined" || t === "null") return null;
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }
  return t || null;
}

export function getAuthToken(user) {
  const fromUser = normalizeAuthToken(user?.token);
  if (fromUser) return fromUser;
  try {
    const parsed = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const fromInfo = normalizeAuthToken(parsed?.token);
    if (fromInfo) return fromInfo;
  } catch {
    /* ignore */
  }
  return normalizeAuthToken(localStorage.getItem("token"));
}

/** Keep userInfo.token and legacy `token` key in sync after login/register. */
export function persistAuthSession(user, token) {
  const normalized = normalizeAuthToken(token);
  if (!user || !normalized) return null;
  const userInfo = { ...user, token: normalized };
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  localStorage.setItem("token", normalized);
  if (userInfo._id || userInfo.id) {
    localStorage.setItem("user", JSON.stringify(userInfo));
  }
  return userInfo;
}

export function clearAuthSession() {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
