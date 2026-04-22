import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { MapPin, ShieldCheck, Star, Backpack, Award, Globe } from "lucide-react";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";
import { getGuideDailyRate } from "../../../utils/guidePricing";
import { useToast } from "../../../context/ToastContext";
import { localTodayYmd } from "../../../utils/dateInputMin";
import { isGuideDoubleLocked, formatAvailableAgainLabel } from "../../../utils/guideAvailability";
import { useAuth } from "../../../context/AuthContext";

const NOTIFY_STORAGE_KEY = "guide_notify_interest";

function rememberNotifyInterest(guideId) {
  if (!guideId) return;
  try {
    const raw = localStorage.getItem(NOTIFY_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(arr) ? arr : [];
    const id = String(guideId);
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TABS = ["About", "Past Tours", "Reviews", "Locations"];

const GuideProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fromBookings } = location.state || {};
  const { showToast } = useToast();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("About");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/api/guides/update/${id}`);
        setGuide(res.data);
      } catch (err) {
        console.error(err);
        setGuide(null);
        setError("Failed to load guide details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGuide();

    if (user && user.token) {
      try {
        const stored = localStorage.getItem("pending_guide_booking");
        if (stored) {
          const pending = JSON.parse(stored);
          if (pending.guideId === id) {
            if (pending.startDate) setStartDate(pending.startDate);
            if (pending.endDate) setEndDate(pending.endDate);
            localStorage.removeItem("pending_guide_booking");
          }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (!guide?.name) return;
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await axios.get(`${API_URL}/api/feedback/display`);
        const relevant = (res.data || []).filter(
          (r) => 
            String(r.targetType || "").toLowerCase() === "guide" && 
            String(r.targetName || "").trim() === String(guide.name || "").trim()
        );
        relevant.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(relevant);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [guide?.name]);

  if (loading) return <div className="p-6 h-screen flex justify-center items-center">Loading...</div>;
  if (error) return <div className="p-6 h-screen flex justify-center items-center text-red-600">{error}</div>;
  if (!guide) return <div className="p-6 h-screen flex justify-center items-center">Guide not found.</div>;

  const todayYmd = localTodayYmd();
  const locked = isGuideDoubleLocked(guide);
  const backOnLabel = formatAvailableAgainLabel(guide);
  const firstName = guide.name ? guide.name.split(" ")[0] : "Guide";
  const basePrice = getGuideDailyRate(guide);
  const coverSrc = resolveMediaUrl(guide.coverPhoto) || resolveMediaUrl(guide.profilePhoto);
  const avatarSrc = resolveMediaUrl(guide.profilePhoto) || resolveMediaUrl(guide.coverPhoto);

  const specialties = Array.isArray(guide.specialties) ? guide.specialties.filter(Boolean) : [];
  const skills = Array.isArray(guide.skills) ? guide.skills.filter(Boolean) : [];
  const gearIncluded = Array.isArray(guide.gear) ? guide.gear.filter((g) => g?.checked) : [];
  const pastTours = Array.isArray(guide.pastTours) ? guide.pastTours : [];
  const gallery = Array.isArray(guide.gallery) ? guide.gallery.filter(Boolean) : [];

  const s = new Date(startDate);
  const e = endDate ? new Date(endDate) : s;
  const totalDays =
    startDate && !isNaN(s.getTime())
      ? endDate && !isNaN(e.getTime()) && e >= s
        ? Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
        : 1
      : 0;

  const totalAmount = totalDays > 0 ? basePrice * totalDays + 12.5 : 0;

  const handleBookGuide = async () => {
    if (!user || !user.token) {
      showToast("Please sign in or create an account to book a guide.", { variant: "info" });
      localStorage.setItem("pending_guide_booking", JSON.stringify({ guideId: guide?._id || id, startDate, endDate }));
      navigate("/signup", { state: { from: window.location.pathname } });
      return;
    }

    const guideId = guide._id || id;
    if (!guideId) return;
    if (locked) {
      showToast("This guide is not accepting bookings right now.", { variant: "info" });
      return;
    }
    if (!startDate) {
      showToast("Please select a start date to book.", { variant: "info" });
      return;
    }
    if (startDate < todayYmd) {
      showToast("Trip dates cannot be in the past. Choose today or a future date.", { variant: "info" });
      return;
    }
    if (endDate && endDate < startDate) {
      showToast("Check-out must be on or after check-in.", { variant: "info" });
      return;
    }

    try {
      const customerName = user.name || "User";

      const payload = {
        guideId,
        guideName: guide.name,
        customerName,
        userId: user._id || user.id,
        status: "pending",
        amount: totalAmount,
        startDate: s,
        endDate: e,
      };

      await axios.post(`${API_URL}/api/guide-bookings/add`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate("/guides/bookings");
    } catch (err) {
      console.error("Failed to book guide:", err);
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 403
          ? "This guide is not accepting bookings right now."
          : "Failed to book guide. Please try again.");
      showToast(msg, { variant: "error" });
    }
  };

  const renderMainColumn = () => {
    if (activeTab === "Past Tours") {
      return (
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Past tours</h2>
          {pastTours.length === 0 ? (
            <p className="text-gray-500 text-[15px] leading-relaxed">
              This guide hasn&apos;t added past tour highlights yet.
            </p>
          ) : (
            <ul className="space-y-6">
              {pastTours.map((t, i) => (
                <li
                  key={i}
                  className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t.title || "Tour"}</h3>
                  {t.summary ? (
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap">{t.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    if (activeTab === "Reviews") {
      const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      return (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-[#f0fdf4] text-[#166534] px-4 py-2 rounded-xl font-bold">
                <Star size={18} fill="currentColor" />
                <span className="text-lg">{averageRating}</span>
                <span className="text-sm opacity-80">({reviews.length})</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="flex items-center justify-center p-8 text-gray-500 font-medium animate-pulse">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-start gap-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <Star size={24} />
              </div>
              <div className="pt-2">
                <p className="text-gray-900 font-bold text-lg mb-2">No reviews yet</p>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Trip feedback will show here after guests complete tours with {firstName}. Be the first to share your experience!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-800 to-green-950 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {review.userName?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-snug">{review.userName || "Camper"}</h4>
                        <div className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} className={i >= review.rating ? "text-gray-300" : ""} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 font-medium leading-relaxed mb-5 text-[15px]">{review.comment}</p>
                  
                  {Array.isArray(review.imageUrls) && review.imageUrls.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 mt-4 no-scrollbar">
                      {review.imageUrls.map((img, idx) => {
                        const resolvedUrl = resolveMediaUrl(img);
                        return (
                          <a key={idx} href={resolvedUrl} target="_blank" rel="noreferrer" className="shrink-0 h-[100px] w-[130px] rounded-2xl overflow-hidden border border-gray-100 block shadow-sm">
                            <img src={resolvedUrl} alt="Review photo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      );
    }

    if (activeTab === "Locations") {
      return (
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Guide details</h2>
          <div className="space-y-4 text-[15px] text-gray-600">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
              <Globe className="text-green-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Identification (NIC)</p>
                <p className="font-semibold text-gray-900">{guide.nic || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
              <Star className="text-amber-500 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Age</p>
                <p className="font-semibold text-gray-900">{guide.age || "—"} years old</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
              <MapPin className="text-green-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Experience</p>
                <p className="font-semibold text-gray-900">{guide.experience ?? 0}+ years guiding</p>
              </div>
            </div>
            <p className="text-gray-500 pt-2">
              Trip meeting points and regions are coordinated with {firstName} after you book.
            </p>
          </div>
        </section>
      );
    }

    /* About */
    return (
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5">About {firstName}</h2>
          <div className="text-gray-600 space-y-5 text-[15px] leading-relaxed">
            <p>
              Hello! I&apos;m {firstName}, a passionate explorer. With over {guide.experience} years of experience
              guiding treks, I specialize in creating immersive experiences.
            </p>
            <p>{guide.description || "My goal is to show you hidden spots that only locals know about."}</p>
          </div>
        </section>

        {specialties.length > 0 && (
          <section>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={20} className="text-green-600" />
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-green-800 border border-green-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100"
                >
                  {sk}
                </span>
              ))}
            </div>
          </section>
        )}

        {gearIncluded.length > 0 && (
          <section>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Backpack size={20} className="text-green-600" />
              Gear included
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {gearIncluded.map((g) => (
                <li
                  key={g.name}
                  className="flex items-center gap-2 text-[15px] text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  {g.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {gallery.length > 0 && (
          <section>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url, i) => {
                const src = resolveMediaUrl(url) || url;
                return (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden h-[28rem] bg-gradient-to-br from-green-900 to-green-950">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className={`w-full h-full object-cover ${locked ? "grayscale-[0.35]" : ""}`}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
          {locked && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-center px-6 z-[5]">
              <span className="text-white text-sm font-black uppercase tracking-[0.25em] mb-2">Unavailable</span>
              <p className="text-white/90 text-base font-semibold max-w-md">
                Admin and guide have paused new bookings for {firstName}.
              </p>
              {backOnLabel ? (
                <p className="text-white/85 text-sm mt-3 font-medium">Expected back: {backOnLabel}</p>
              ) : (
                <p className="text-white/75 text-sm mt-3">Check back soon or tap Notify me below.</p>
              )}
            </div>
          )}

          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-green-800 shadow-xl flex items-center justify-center text-white text-4xl font-bold">
              {avatarSrc ? (
                <img src={avatarSrc} alt={guide.name} className="w-full h-full object-cover" />
              ) : (
                guide.name?.charAt(0)?.toUpperCase() || "?"
              )}
            </div>

            <div className="mb-2 text-white">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{guide.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-white border border-white/30">
                  <ShieldCheck size={16} />
                  <span>Verified Guide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mt-10 gap-8 overflow-x-auto hide-scrollbar px-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 whitespace-nowrap text-sm font-bold border-b-[3px] transition-colors duration-200 ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
          <div className={`space-y-12 px-2 ${fromBookings ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-8'}`}>{renderMainColumn()}</div>

          {!fromBookings && (
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sticky top-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-3xl font-extrabold">LKR {basePrice}</span>
                  <span className="text-gray-500 text-[15px] font-medium ml-1">/ day</span>
                </div>
              </div>

              <div className="mb-8 border border-gray-200 rounded-3xl px-6 py-5">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Trip Dates</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={todayYmd}
                      disabled={locked}
                      onChange={(e) => {
                        const v = e.target.value;
                        setStartDate(v);
                        if (endDate && endDate < v) setEndDate(v);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all font-semibold text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      onFocus={(e) => {
                        e.target.style.borderColor = "#166534";
                        e.target.style.boxShadow = "0 0 0 2px rgba(22,101,52,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Check-Out (Optional)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || todayYmd}
                      disabled={locked}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all font-semibold text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      onFocus={(e) => {
                        e.target.style.borderColor = "#166534";
                        e.target.style.boxShadow = "0 0 0 2px rgba(22,101,52,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-[15px]">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>
                    {totalDays} Day{totalDays !== 1 && "s"}
                  </span>
                  <span className="text-gray-900">LKR {basePrice * totalDays}.00</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Booking fee</span>
                  <span className="text-gray-900">LKR 12.50</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg pt-5 border-t border-gray-100 text-gray-900">
                  <span>Total</span>
                  <span>LKR {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {locked ? (
                  <>
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
                    >
                      Check back soon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        rememberNotifyInterest(guide._id || id);
                        showToast("Saved — we’ll help you spot when bookings reopen.", {
                          variant: "success",
                          duration: 6000,
                        });
                      }}
                      className="w-full py-3 rounded-2xl font-bold text-[14px] border-2 border-green-700 text-green-800 hover:bg-green-50 transition-colors"
                    >
                      Notify me
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookGuide}
                    disabled={!startDate}
                    className={`w-full text-white py-4 rounded-2xl font-bold text-[15px] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] 
                  ${
                    startDate
                      ? "hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
                      : "cursor-not-allowed opacity-60"
                  }`}
                    style={{ backgroundColor: startDate ? "#166534" : "#9ca3af" }}
                    onMouseEnter={(e) => {
                      if (startDate) e.currentTarget.style.backgroundColor = "#14532d";
                    }}
                    onMouseLeave={(e) => {
                      if (startDate) e.currentTarget.style.backgroundColor = "#166534";
                    }}
                  >
                    Book Now
                  </button>
                )}
              </div>

              <p className="text-center text-[12px] text-gray-400 mt-6 leading-relaxed font-medium px-2">
                {locked
                  ? "This profile is visible for reference only until bookings reopen."
                  : `No immediate payment required. ${firstName} will review your request within 24 hours.`}
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;
