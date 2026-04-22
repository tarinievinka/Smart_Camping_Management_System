import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LayoutGrid, Calendar, Heart, LogOut, Search, Bell, Settings, MapPin, ArrowRight, Plus, Trash2, X } from "lucide-react";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";
import { getGuideDailyRate } from "../../../utils/guidePricing";
import { useToast } from "../../../context/ToastContext";
import { localTodayYmd } from "../../../utils/dateInputMin";
import { getCustomerBookingName } from "../../../utils/customerIdentity";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Bookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedGuides, setBookedGuides] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const hintToastShown = useRef(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleEditClick = (guideObj) => {
    setEditingBooking(guideObj);
    const b = guideObj.booking;
    setEditStart(b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : (b.bookedAt ? new Date(b.bookedAt).toISOString().split('T')[0] : ""));
    setEditEnd(b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : (b.bookedAt ? new Date(b.bookedAt).toISOString().split('T')[0] : ""));
  };

  const handleUpdateBooking = async () => {
    if (!editStart) {
      showToast("Start date required.", { variant: "info" });
      return;
    }
    const todayYmd = localTodayYmd();
    if (editStart < todayYmd) {
      showToast("Trip dates cannot be in the past.", { variant: "info" });
      return;
    }
    if (editEnd && editEnd < editStart) {
      showToast("End date must be on or after the start date.", { variant: "info" });
      return;
    }
    const s = new Date(editStart);
    const e = editEnd ? new Date(editEnd) : s;
    const totalDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);

    const basePrice = getGuideDailyRate(editingBooking);

    const totalAmount = basePrice * totalDays + 12.50;

    try {
      const payload = { startDate: s, endDate: e, amount: totalAmount };
      await axios.put(`${API_URL}/api/guide-bookings/update/${editingBooking.booking._id}`, payload);
      setBookedGuides(prev => prev.map(g => g.booking._id === editingBooking.booking._id ? { ...g, booking: { ...g.booking, ...payload } } : g));
      setEditingBooking(null);
    } catch (err) {
      showToast("Failed to update booking dates.", { variant: "error" });
    }
  };

  useEffect(() => {
    const fetchBookedGuides = async () => {
      try {
        setLoading(true);
        setError(null);

        const bookingsRes = await axios.get(`${API_URL}/api/guide-bookings/display`);
        const parsedBookings = bookingsRes.data || [];

        if (!Array.isArray(parsedBookings) || parsedBookings.length === 0) {
          setBookedGuides([]);
          return;
        }

        const res = await axios.get(`${API_URL}/api/guides/display`);
        const guides = Array.isArray(res.data) ? res.data : res.data?.guides || res.data?.data || [];

        const merged = parsedBookings.map((b) => {
          const gid = typeof b.guideId === 'object' ? b.guideId?._id : b.guideId;
          const guide = (typeof b.guideId === 'object' ? b.guideId : null) || guides.find((g) => String(g._id) === String(gid));
          
          if (!guide) return null;
          return { ...guide, booking: b };
        }).filter(Boolean);

        merged.sort((a, b) => new Date(b.booking.startDate || b.booking.bookedAt).getTime() - new Date(a.booking.startDate || a.booking.bookedAt).getTime());
        setBookedGuides(merged);
      } catch (err) {
        setError("Failed to load bookings.");
        setBookedGuides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedGuides();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/guide-bookings/notifications`, {
          params: { customerName: getCustomerBookingName() },
        });
        if (!cancelled) setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hintToastShown.current) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    hintToastShown.current = true;
    showToast("You have new booking updates — open the notifications bell.", {
      variant: "info",
      duration: 8000,
    });
  }, [notifications, showToast]);

  const markNotificationRead = async (id) => {
    if (!id) return;
    try {
      await axios.patch(`${API_URL}/api/guide-bookings/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      showToast("Could not mark notification read.", { variant: "error" });
    }
  };

  const getFirstLanguage = (language) => {
    if (!language) return "Local";
    if (Array.isArray(language)) return language[0] || "Local";
    return language.split(",")[0].trim();
  };

  const guidePhoto = (g) => resolveMediaUrl(g.coverPhoto) || resolveMediaUrl(g.profilePhoto);

  const formatDateRange = (start, end, fallback) => {
    const formatStr = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    if (start && end) {
      if (new Date(start).getTime() === new Date(end).getTime()) return formatStr(start);
      return `${formatStr(start)} - ${formatStr(end)}`;
    }
    if (start) return formatStr(start);
    if (fallback) return formatStr(fallback);
    return "Unknown Date";
  };

  /** Readable full name for cards (does not change stored data) */
  const formatGuideDisplayName = (name) => {
    if (!name || typeof name !== "string") return "Guide";
    return name
      .trim()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
      .filter(Boolean)
      .join(" ");
  };

  const statusBadgeClass = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "pending") return "bg-rose-500 text-white";
    if (s === "confirmed") return "bg-green-700 text-white";
    if (s === "cancelled") return "bg-gray-600 text-white";
    if (s === "completed") return "bg-emerald-800 text-white";
    return "bg-amber-600 text-white";
  };

  const statusLabel = (status) => String(status || "pending").toUpperCase();

  const navItems = [
    { icon: LayoutGrid, label: "Browse Guides", path: "/guides" },
    { icon: Calendar, label: "My Bookings", path: "/guides/bookings" },
    { icon: Heart, label: "Favorites", path: "/guides/favourites" },
  ];

  const upcomingBookings = bookedGuides.filter(b => b.booking.status !== "completed");
  const pastMemories = bookedGuides.filter(b => b.booking.status === "completed");

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] font-sans text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shrink-0 hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ backgroundColor: '#166534' }}>W</div>
          <div><h2 className="text-gray-900 font-bold text-lg">WildGuide</h2><p className="text-gray-500 text-xs">Adventure awaits</p></div>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navItems.map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${location.pathname === item.path ? "text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
              style={location.pathname === item.path ? { backgroundColor: '#166534' } : {}}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.removeItem("auth_session"); navigate("/guides"); }} className="flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-xl transition-colors mt-auto">
          <LogOut size={20} className="rotate-180" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12 gap-4">
            <div className="relative w-full max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search your expeditions..." className="w-full bg-gray-200/60 border-none rounded-full py-3.5 pl-12 pr-6 text-sm font-medium text-gray-700 placeholder-gray-500 outline-none" style={{ '--tw-ring-color': '#166534' }} onFocus={e => e.target.style.outline = `2px solid #166534`} onBlur={e => e.target.style.outline = 'none'} />
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-xl z-50 py-2">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">No updates yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => {
                          if (!n.read) markNotificationRead(n._id);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                          !n.read ? "bg-emerald-50/60" : ""
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                        </div>
                        <div className="font-bold text-gray-900 text-sm">{n.title}</div>
                        {n.body && <p className="text-sm text-gray-600 mt-1 leading-snug">{n.body}</p>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-[40px] font-extrabold text-gray-900 leading-tight mb-1">Your Expeditions</h1>
              <p className="text-gray-500 font-medium">Manage your upcoming journeys and revisit past memories.</p>
            </div>
            <div className="bg-[#E2EAF4] text-[#718DAF] px-4 py-1.5 rounded-full text-xs font-bold uppercase">{bookedGuides.length} Active Trips</div>
          </div>

          {loading && <div className="py-20 text-center text-gray-400 font-extrabold text-xl animate-pulse">Loading Bookings...</div>}
          {error && <div className="py-20 text-center text-red-500 font-bold text-lg">{error}</div>}
          {!loading && !error && bookedGuides.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={32} className="text-gray-400" /></div>
              <p className="text-gray-500 font-bold text-lg">No trips booked yet.</p>
              <button onClick={() => navigate("/guides")} className="font-bold mt-2 hover:underline" style={{ color: '#166534' }}>Explore Destinations</button>
            </div>
          )}

          {!loading && !error && upcomingBookings.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: '#166534' }}></div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              </div>
              <div className="flex flex-col gap-6">
                {upcomingBookings.map((b) => {
                  const guideFullName = formatGuideDisplayName(b.name);
                  return (
                    <div
                      key={b.booking._id}
                      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-all min-h-[280px]"
                    >
                      <div className="sm:w-[42%] min-h-[240px] sm:min-h-[280px] relative overflow-hidden bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center shrink-0">
                        {guidePhoto(b) ? (
                          <img
                            src={guidePhoto(b)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <span className="text-white text-7xl font-bold opacity-90 relative z-[1]">
                            {guideFullName.charAt(0) || "?"}
                          </span>
                        )}
                        <div
                          className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider shadow-md ${statusBadgeClass(b.booking.status)}`}
                        >
                          {statusLabel(b.booking.status)}
                        </div>
                      </div>
                      <div className="flex-1 p-8 flex flex-col justify-center min-w-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Expedition with {guideFullName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: "#166534" }}>
                          <MapPin size={16} className="shrink-0" />
                          <span>{getFirstLanguage(b.language)} Region</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#A6B2CA] font-bold uppercase tracking-widest mb-1.5">Booked For</p>
                            <p className="text-sm font-bold text-gray-900 break-words">
                              {formatDateRange(b.booking.startDate, b.booking.endDate, b.booking.bookedAt)}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#A6B2CA] font-bold uppercase tracking-widest mb-1.5">Lead Guide</p>
                            <p className="text-sm font-bold text-gray-900 break-words leading-snug">{guideFullName}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-auto">
                          <button
                            type="button"
                            onClick={() => navigate(`/guides/manage-trip/${b.booking._id}`)}
                            className="flex-1 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors"
                            style={{ backgroundColor: "#166534" }}
                          >
                            Manage Trip
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/guides/${b._id}`, { state: { fromBookings: true } })}
                            className="text-sm font-bold flex items-center justify-center gap-1.5 hover:gap-2 transition-all flex-1 py-3.5 rounded-2xl"
                            style={{ color: "#166534", backgroundColor: "#f0fdf4" }}
                          >
                            View guide profile <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && !error && pastMemories.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative mb-20">
              <div className="flex items-center gap-2 mb-6"><div className="w-1.5 h-6 bg-[#6B7C8C] rounded-full"></div><h2 className="text-xl font-bold text-gray-900">Past Memories</h2></div>
              <div className="space-y-4">
                {pastMemories.map(guide => (
                  <div key={guide.booking.bookedAt} className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm group hover:bg-gray-50/50">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center text-white text-2xl font-bold">
                        {guidePhoto(guide) ? (
                          <img src={guidePhoto(guide)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          guide.name?.charAt(0)?.toUpperCase() || "?"
                        )}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-gray-900 mb-1.5">{guide.name} — {getFirstLanguage(guide.language)} Guided Tour</h4>
                        <div className="flex items-center gap-4 text-xs font-bold text-[#A6B2CA]"><span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDateRange(guide.booking.startDate, guide.booking.endDate, guide.booking.bookedAt)}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 pr-2">
                      <button onClick={(e) => { e.stopPropagation(); navigate('/guide-feedback', { state: { targetType: 'guide', targetId: guide._id, targetName: guide.name } }); }} className="px-6 py-2.5 bg-[#F4F5F7] text-gray-700 font-bold text-sm rounded-xl hover:bg-[#e4e7ed] transition-colors">Add Reviews</button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/guides/${guide._id}`, { state: { fromBookings: true } }); }} className="px-6 py-2.5 text-[#166534] bg-[#f0fdf4] font-bold text-sm rounded-xl hover:bg-[#dcfce7] transition-all flex items-center gap-1.5 hover:gap-2">View guide profile <ArrowRight size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-6 right-8">
                <button onClick={() => navigate("/guides")} className="flex items-center gap-2 text-white px-6 py-3.5 rounded-full font-bold text-[15px] transition-transform hover:-translate-y-1" style={{ backgroundColor: '#166534', boxShadow: '0 8px 20px rgba(22,101,52,0.3)' }}><Plus size={20} /> New Booking</button>
              </div>
            </div>
          )}

          {/* Edit Booking Modal */}
          {editingBooking && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full relative">
                <button onClick={() => setEditingBooking(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Trip Dates</h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Date</label>
                    <input type="date" value={editStart} min={localTodayYmd()} onChange={e => {
                      const v = e.target.value;
                      setEditStart(v);
                      if (editEnd && editEnd < v) setEditEnd(v);
                    }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" style={{ '--focus-border': '#166534' }} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Date</label>
                    <input type="date" value={editEnd} onChange={e => setEditEnd(e.target.value)} min={editStart || localTodayYmd()} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                </div>
                <button onClick={handleUpdateBooking} className="w-full text-white font-bold py-3.5 rounded-xl transition-colors" style={{ backgroundColor: '#166534' }}>
                  Update Trip
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Bookings;