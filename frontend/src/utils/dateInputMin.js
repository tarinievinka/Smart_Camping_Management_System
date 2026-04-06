/** Today's date as YYYY-MM-DD in the user's local timezone (for `<input type="date" min>`). */
export function localTodayYmd() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
