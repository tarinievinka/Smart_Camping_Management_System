/**
 * Guide is hidden from new bookings only when BOTH:
 * - Admin set availability to false (dashboard / form)
 * - Guide paused their profile (business profile)
 */
export function isGuideDoubleLocked(guide) {
  if (!guide || typeof guide !== "object") return false;
  return guide.availability === false && guide.isPaused === true;
}

export function formatAvailableAgainLabel(guide) {
  if (!guide?.availableAgainAt) return null;
  const d = new Date(guide.availableAgainAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
