import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/** Treat bookings older than this (with no explicit completed status) as completed */
export const BOOKING_COMPLETED_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

/** Customer request awaiting guide action */
export function isPendingGuideBooking(b) {
  const s = String(b?.status ?? "").trim().toLowerCase();
  return s === "pending";
}

export function isConfirmedGuideBooking(b) {
  return String(b?.status || "").toLowerCase() === "confirmed";
}

/**
 * Normalize backend booking status into: upcoming | completed | cancelled
 */
export function deriveComputedStatus(b, now = Date.now()) {
  const s = String(b?.status ?? "").trim().toLowerCase();
  if (s === "completed") return "completed";
  if (s === "cancelled") return "cancelled";
  // Requests awaiting the guide must stay in "upcoming" — do not age them out by trip date
  if (s === "pending") return "upcoming";
  const bookedAtMs = b?.startDate
    ? new Date(b.startDate).getTime()
    : b?.bookedAt
      ? new Date(b.bookedAt).getTime()
      : null;
  if (bookedAtMs && now - bookedAtMs > BOOKING_COMPLETED_AFTER_MS) return "completed";
  return "upcoming";
}

export function partitionGuideBookings(entries, now = Date.now()) {
  const normalized = entries.map((b) => {
    const bookedAtMs = b?.startDate
      ? new Date(b.startDate).getTime()
      : b?.bookedAt
        ? new Date(b.bookedAt).getTime()
        : null;
    return {
      ...b,
      bookedAtMs,
      computedStatus: deriveComputedStatus(b, now),
    };
  });

  const upcoming = normalized
    .filter((b) => b.computedStatus === "upcoming")
    .sort((a, b) => (a.bookedAtMs || 0) - (b.bookedAtMs || 0));

  const completed = normalized
    .filter((b) => b.computedStatus === "completed")
    .sort((a, b) => (b.bookedAtMs || 0) - (a.bookedAtMs || 0));

  return { normalized, upcoming, completed };
}

export function useGuideBookingsForGuide(guideId) {
  const [loading, setLoading] = useState(!!guideId);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!guideId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/guide-bookings/display`);
      const all = Array.isArray(res.data) ? res.data : [];
      const mine = all.filter((b) => String(b.guideId) === String(guideId));
      setEntries(mine);
    } catch {
      setError("Failed to load bookings.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { normalized, upcoming, completed } = useMemo(
    () => partitionGuideBookings(entries),
    [entries]
  );

  return {
    loading,
    error,
    entries,
    setEntries,
    normalized,
    upcoming,
    completed,
    refresh,
  };
}
