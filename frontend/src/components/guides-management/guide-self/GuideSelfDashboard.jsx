import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CalendarCheck, Banknote, Star, TrendingUp, Clock } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide, GUIDE_SELF_DASHBOARD_PATH } from "./guideSession";
import { useGuideBookingsForGuide, isPendingGuideBooking } from "./useGuideBookingsForGuide";
import Sidebar from "./Sidebar";
import { useToast } from "../../../context/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const formatDateRange = (start, end, fallback) => {
  const formatStr = (d) => new Date(d).toLocaleDateString();
  if (start && end) {
    if (new Date(start).getTime() === new Date(end).getTime()) return formatStr(start);
    return `${formatStr(start)} - ${formatStr(end)}`;
  }
  if (start) return formatStr(start);
  if (fallback) return formatStr(fallback);
  return "-";
};

const statusPill = (b) => {
  const raw = String(b?.status || "");
  const lower = raw.toLowerCase();
  if (b.computedStatus === "completed" || lower === "completed")
    return { label: "COMPLETED", bg: "#dcfce7", color: "#15803d" };
  if (b.computedStatus === "cancelled" || lower === "cancelled")
    return { label: "CANCELLED", bg: "#fee2e2", color: "#b91c1c" };
  if (lower === "pending") return { label: "PENDING", bg: "#fee2e2", color: "#b91c1c" };
  if (lower === "confirmed") return { label: "CONFIRMED", bg: "#dcfce7", color: "#15803d" };
  return { label: raw.toUpperCase() || "ACTIVE", bg: "#fef9c3", color: "#a16207" };
};

const GuideSelfDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [guideName, setGuideName] = useState("");
  const [guideLoading, setGuideLoading] = useState(!!loggedInAsGuide);

  const { loading: bookingsLoading, upcoming, completed, normalized, refresh } = useGuideBookingsForGuide(
    loggedInAsGuide ? currentGuideId : null
  );

  const [confirmBusyId, setConfirmBusyId] = useState(null);

  const confirmBooking = async (bookingId) => {
    if (!bookingId) return;
    setConfirmBusyId(bookingId);
    try {
      await axios.put(`${API_URL}/api/guide-bookings/update/${bookingId}`, { status: "Confirmed" });
      await refresh();
      toast.showToast("Booking confirmed.", { variant: "success" });
    } catch (e) {
      console.error(e);
      toast.showToast("Could not confirm booking.", { variant: "error" });
    } finally {
      setConfirmBusyId(null);
    }
  };

  useEffect(() => {
    if (!loggedInAsGuide || !currentGuideId) {
      setGuideLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        if (!cancelled) setGuideName(res.data?.name || "");
      } catch {
        if (!cancelled) setGuideName("");
      } finally {
        if (!cancelled) setGuideLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentGuideId, loggedInAsGuide]);

  const earningsEstimate = useMemo(() => {
    return completed.reduce((sum, b) => sum + (typeof b?.amount === "number" ? b.amount * 0.9 : 0), 0);
  }, [completed]);

  const recentRows = useMemo(
    () =>
      [...normalized]
        .sort((a, b) => (b.bookedAtMs || 0) - (a.bookedAtMs || 0))
        .slice(0, 5),
    [normalized]
  );

  const firstUpcoming = upcoming[0];

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Guide dashboard</h1>
          <p className="text-gray-600 mb-2">
            Sign in with a guide account from user management, then open your dashboard.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            For local development, set{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">REACT_APP_GUIDE_SELF_DEV_BYPASS=true</code> and{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">REACT_APP_JAYANTHA_GUIDE_ID</code> (Jayantha&apos;s MongoDB{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">_id</code>) in <code className="text-xs bg-gray-100 px-1 rounded">frontend/.env</code>.
            Restart <code className="text-xs bg-gray-100 px-1 rounded">npm run dev</code> after editing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={() => navigate("/guides")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = guideName || "Guide";
  const loading = guideLoading || bookingsLoading;

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-gray-800">
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="flex-1 p-10 overflow-y-auto w-full max-w-[1200px] mx-auto">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? "Welcome back…" : `Welcome back, ${displayName}!`}
            </h2>
            <p className="text-gray-500 text-sm">Here&apos;s an overview of your professional business.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <CalendarCheck size={24} />
              </div>
              <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp size={12} /> live
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active bookings</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? "—" : upcoming.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Banknote size={24} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Earnings</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {loading ? "—" : `LKR ${earningsEstimate.toFixed(0)}`}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400">
                <Star size={24} fill="currentColor" />
              </div>
              <div className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold">
                Completed
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Completed trips</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? "—" : completed.length}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent bookings</h3>
              <button
                type="button"
                onClick={() => navigate("/guides/ownbookings")}
                className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors"
              >
                View all
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading bookings…</p>
              ) : recentRows.length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings yet.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4 pt-2">Client</th>
                      <th className="pb-4 pt-2">Trip date</th>
                      <th className="pb-4 pt-2 text-right">Status</th>
                      <th className="pb-4 pt-2 text-right w-[120px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentRows.map((b) => {
                      const pill = statusPill(b);
                      const initials = (b.customerName || "G")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <tr key={b._id || b.customerName} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                                {initials}
                              </div>
                              <span className="font-semibold text-gray-900">{b.customerName || "Guest"}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-500 font-medium">
                            {formatDateRange(b.startDate, b.endDate, b.bookedAt)}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider"
                              style={{ background: pill.bg, color: pill.color }}
                            >
                              {pill.label}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {isPendingGuideBooking(b) && b._id ? (
                              <button
                                type="button"
                                disabled={confirmBusyId === b._id}
                                onClick={() => confirmBooking(b._id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                              >
                                {confirmBusyId === b._id ? "…" : "Confirm"}
                              </button>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
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

          <div className="space-y-8">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Next trip</h3>
              {firstUpcoming ? (
                <>
                  <div className="rounded-2xl border border-gray-100 p-4 mb-4 bg-gray-50">
                    <div className="inline-block px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded mb-2 uppercase tracking-wide">
                      Upcoming
                    </div>
                    <h4 className="text-gray-900 font-bold text-lg leading-tight">
                      {formatDateRange(firstUpcoming.startDate, firstUpcoming.endDate, firstUpcoming.bookedAt)}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                      <Clock size={16} className="text-gray-400 shrink-0" />
                      {firstUpcoming.customerName || "Guest"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/guides/owncalendar")}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    Open calendar
                  </button>
                  {isPendingGuideBooking(firstUpcoming) && firstUpcoming._id && (
                    <button
                      type="button"
                      disabled={confirmBusyId === firstUpcoming._id}
                      onClick={() => confirmBooking(firstUpcoming._id)}
                      className="w-full mt-2 py-3 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                    >
                      {confirmBusyId === firstUpcoming._id ? "Confirming…" : "Confirm booking"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No upcoming bookings. New requests will show here.</p>
              )}
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Quick links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/guides/manageownprofile")}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Edit business profile
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/guides/ownprofile")}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    View public profile
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate(GUIDE_SELF_DASHBOARD_PATH)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Refresh dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuideSelfDashboard;
