/**
 * Daily rate shown to customers — uses guide.dailyRate from DB when set.
 */
export function getGuideDailyRate(guide) {
  if (guide == null) return 0;
  const dr = guide.dailyRate;
  if (dr != null && dr !== "" && !Number.isNaN(Number(dr))) return Number(dr);
  return 80 + (Number(guide.experience) || 0) * 15;
}
