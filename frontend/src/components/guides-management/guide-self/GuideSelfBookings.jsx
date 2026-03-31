import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const COMPLETED_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

const GuideSelfBookings = () => {
  const navigate = useNavigate();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [loading, setLoading] = useState(true);
  const [guideName, setGuideName] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentGuideId) return;

        const raw = localStorage.getItem("guide_bookings");
        const parsed = raw ? JSON.parse(raw) : [];
        const all = Array.isArray(parsed) ? parsed : [];
        const mine = all.filter((b) => b?.guideId === currentGuideId);
        setEntries(mine);

        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        setGuideName(res.data?.name || "");
      } catch (err) {
        setError("Failed to load bookings.");
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [currentGuideId]);

  const derived = useMemo(() => {
    const now = Date.now();

    const normalized = entries.map((b) => {
      const bookedAtMs = b?.bookedAt ? new Date(b.bookedAt).getTime() : null;
      const computedStatus =
        b?.status || (bookedAtMs && now - bookedAtMs > COMPLETED_AFTER_MS ? "completed" : "pending");
      return { ...b, bookedAtMs, computedStatus };
    });

    const upcoming = normalized
      .filter((b) => b.computedStatus === "pending")
      .sort((a, b) => (a.bookedAtMs || 0) - (b.bookedAtMs || 0));
    const completed = normalized
      .filter((b) => b.computedStatus === "completed")
      .sort((a, b) => (b.bookedAtMs || 0) - (a.bookedAtMs || 0));

    return { upcoming, completed };
  }, [entries]);

  const removeBooking = (bookingKey) => {
    const raw = localStorage.getItem("guide_bookings");
    const parsed = raw ? JSON.parse(raw) : [];
    const all = Array.isArray(parsed) ? parsed : [];

    const next = all.filter((b) => {
      const key = `${b?.guideId}:${b?.customerName || "Guest"}:${b?.bookedAt}`;
      return key !== bookingKey;
    });

    localStorage.setItem("guide_bookings", JSON.stringify(next));
    setEntries(next.filter((b) => b?.guideId === currentGuideId));
  };

  const markCompleted = (bookingKey) => {
    const raw = localStorage.getItem("guide_bookings");
    const parsed = raw ? JSON.parse(raw) : [];
    const all = Array.isArray(parsed) ? parsed : [];

    const next = all.map((b) => {
      const key = `${b?.guideId}:${b?.customerName || "Guest"}:${b?.bookedAt}`;
      if (key === bookingKey) return { ...b, status: "completed" };
      return b;
    });

    localStorage.setItem("guide_bookings", JSON.stringify(next));
    setEntries(next.filter((b) => b?.guideId === currentGuideId));
  };

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
        <p className="text-gray-600">Login as a guide to view your bookings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{guideName ? `Bookings for ${guideName}` : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/guides/me/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard <ArrowRight size={16} />
        </button>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
        {derived.upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming bookings.</p>
        ) : (
          <div className="space-y-3">
            {derived.upcoming.map((b, idx) => {
              const bookingKey = `${b?.guideId}:${b?.customerName || "Guest"}:${b?.bookedAt}`;
              return (
                <div key={idx} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">{b.customerName || "Guest"}</p>
                    <p className="text-sm text-gray-600 mt-1 inline-flex items-center gap-2">
                      <Clock size={16} className="text-yellow-700" />
                      {b.bookedAtMs ? new Date(b.bookedAtMs).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => markCompleted(bookingKey)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBooking(bookingKey)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      aria-label="Remove booking"
                      title="Remove booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Completed</h2>
        {derived.completed.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {derived.completed.map((b, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{b.customerName || "Guest"}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Completed on {b.bookedAtMs ? new Date(b.bookedAtMs).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 size={16} /> Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideSelfBookings;

