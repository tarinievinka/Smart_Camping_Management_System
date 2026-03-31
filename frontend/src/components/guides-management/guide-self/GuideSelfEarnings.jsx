import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";

const GuideSelfEarnings = () => {
  const navigate = useNavigate();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const computed = useMemo(() => {
    const raw = localStorage.getItem("guide_bookings");
    const parsed = raw ? JSON.parse(raw) : [];
    const entries = Array.isArray(parsed) ? parsed : [];
    const mine = currentGuideId ? entries.filter((b) => b?.guideId === currentGuideId) : [];

    const pending = mine.filter((b) => b?.status !== "completed").length;
    const completed = mine.filter((b) => b?.status === "completed").length;

    const earnings = mine.reduce((sum, b) => {
      const amount = typeof b?.amount === "number" ? b.amount : 0;
      // service fee (10%)
      return sum + amount * 0.9;
    }, 0);

    return { pending, completed, earnings, count: mine.length };
  }, [currentGuideId]);

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Earnings</h1>
        <p className="text-gray-600">Login as a guide to view your earnings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-gray-500 text-sm mt-1">Estimated from bookings (local demo)</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/guides/me/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-500 text-sm">Total Bookings</h2>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold mt-2">{computed.count}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-bold mt-2 text-yellow-600">{computed.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm">Completed</h2>
          <p className="text-2xl font-bold mt-2 text-green-600">{computed.completed}</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-2">Your Earnings (est.)</h2>
        <p className="text-3xl font-bold text-green-700">${computed.earnings.toFixed(2)}</p>
        <p className="text-gray-500 text-sm mt-2">
          This is calculated using your booking estimate stored in `guide_bookings` in `localStorage`.
        </p>
      </div>
    </div>
  );
};

export default GuideSelfEarnings;

