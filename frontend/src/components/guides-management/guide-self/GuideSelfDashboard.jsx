import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Clock, DollarSign, ArrowRight } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const COMPLETED_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // simple heuristic for local/demo data

const GuideSelfDashboard = () => {
  const navigate = useNavigate();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guideName, setGuideName] = useState("");
  const [bookingEntries, setBookingEntries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentGuideId) {
          setBookingEntries([]);
          setGuideName("");
          return;
        }

        // Load bookings created from the "Book Guide" flow
        const raw = localStorage.getItem("guide_bookings");
        const parsed = raw ? JSON.parse(raw) : [];
        const entries = Array.isArray(parsed) ? parsed : [];
        const mine = entries.filter((b) => b?.guideId === currentGuideId);
        setBookingEntries(mine);

        // Load guide name for header
        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        setGuideName(res.data?.name || "");
      } catch (err) {
        setError("Failed to load dashboard data.");
        setBookingEntries([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentGuideId]);

  const derived = useMemo(() => {
    const now = Date.now();

    const withStatus = bookingEntries.map((b) => {
      const bookedAt = b?.bookedAt ? new Date(b.bookedAt).getTime() : null;
      const computedStatus =
        b?.status ||
        (bookedAt && now - bookedAt > COMPLETED_AFTER_MS ? "completed" : "pending");
      return { ...b, bookedAtMs: bookedAt, computedStatus };
    });

    const totalBookings = withStatus.length;
    const completed = withStatus.filter((b) => b.computedStatus === "completed").length;
    const pending = totalBookings - completed;

    const totalEarnings = withStatus.reduce((sum, b) => {
      const amount = typeof b?.amount === "number" ? b.amount : 0;
      // example: after service fee (10%)
      return sum + amount * 0.9;
    }, 0);

    const recent = [...withStatus]
      .sort((a, b) => (b.bookedAtMs || 0) - (a.bookedAtMs || 0))
      .slice(0, 6);

    return { withStatus, totalBookings, completed, pending, totalEarnings, recent };
  }, [bookingEntries]);

  const markCompleted = (idx) => {
    const entry = derived.withStatus[idx];
    if (!entry) return;

    // Persist back to localStorage
    const raw = localStorage.getItem("guide_bookings");
    const parsed = raw ? JSON.parse(raw) : [];
    const entries = Array.isArray(parsed) ? parsed : [];

    const targetKey = `${entry.guideId}:${entry.customerName || "Guest"}:${entry.bookedAt}`;

    const next = entries.map((b) => {
      const key = `${b?.guideId}:${b?.customerName || "Guest"}:${b?.bookedAt}`;
      if (key === targetKey) return { ...b, status: "completed" };
      return b;
    });

    localStorage.setItem("guide_bookings", JSON.stringify(next));
    setBookingEntries((prev) =>
      prev.map((b) =>
        `${b?.guideId}:${b?.customerName || "Guest"}:${b?.bookedAt}` === targetKey
          ? { ...b, status: "completed" }
          : b
      )
    );
  };

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Guide Dashboard</h1>
        <p className="text-gray-600">
          Login as a guide to view your own dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold">Guide Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{guideName ? `Welcome, ${guideName}` : ""}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/guides/me/profile")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Manage Profile <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm">Total Bookings</h2>
          <p className="text-2xl font-bold mt-2">{derived.totalBookings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-bold mt-2 text-yellow-600">{derived.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm">Completed</h2>
          <p className="text-2xl font-bold mt-2 text-green-600">{derived.completed}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-500 text-sm">Earnings (est.)</h2>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold mt-2">${derived.totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <button
            type="button"
            onClick={() => navigate("/guides/me/bookings")}
            className="text-green-700 text-sm font-semibold hover:underline"
          >
            View all bookings
          </button>
        </div>

        {derived.recent.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {derived.recent.map((b, idx) => {
                const status = b.computedStatus;
                const displayDate = b.bookedAtMs ? new Date(b.bookedAtMs).toLocaleDateString() : "-";
                return (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{b.customerName || "Guest"}</td>
                    <td className="py-2">{displayDate}</td>
                    <td className="py-2">
                      {status === "completed" ? (
                        <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-yellow-700 font-semibold">
                          <Clock size={16} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => markCompleted(idx)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GuideSelfDashboard;

