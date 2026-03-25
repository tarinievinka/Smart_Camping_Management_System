import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Mail, Phone, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "../guide-self/guideSession";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GuideProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        // Backend route: GET /api/guides/update/:id
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
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!guide) return <div className="p-6">Guide not found.</div>;

  const handleBookGuide = () => {
    const guideId = guide._id || id;
    if (!guideId) return;

    try {
      const customerName =
        localStorage.getItem("user_name") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        "Guest";

      // Keep the same pricing heuristic used in the marketplace cards.
      const exp = typeof guide.experience === "number" ? guide.experience : Number(guide.experience || 0);
      const amount = 80 + exp * 15;

      const raw = localStorage.getItem("guide_bookings");
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];

      // Avoid spamming duplicates within a short time window for same customer + guide.
      const now = Date.now();
      const DUP_WINDOW_MS = 60 * 1000;
      const shouldDuplicate =
        existing.some(
          (b) =>
            b?.guideId === guideId &&
            (b?.customerName || "Guest") === customerName &&
            b?.bookedAt &&
            now - new Date(b.bookedAt).getTime() < DUP_WINDOW_MS
        );

      const next = shouldDuplicate
        ? existing
        : [
            ...existing,
            {
              guideId,
              customerName,
              bookedAt: now,
              status: "pending",
              amount,
            },
          ];

      localStorage.setItem("guide_bookings", JSON.stringify(next));
    } catch {
      // If storage fails, just do navigation.
    }

    navigate("/guides/bookings");
  };

  const isViewingOwnGuide = loggedInAsGuide && currentGuideId && guide?._id && currentGuideId === guide._id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Card Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-28 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-green-700 shadow-md">
              {guide.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-6 px-6">
          {/* Name + Status */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{guide.name}</h1>

            <span
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                guide.availability
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {guide.availability ? (
                <>
                  <CheckCircle size={14} /> Available
                </>
              ) : (
                <>
                  <XCircle size={14} /> Unavailable
                </>
              )}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-500 mt-3">
            {guide.description || "No description available."}
          </p>

          {/* Info Section */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="text-gray-400" size={18} />
              <span>{guide.email}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="text-gray-400" size={18} />
              <span>{guide.phone}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="text-gray-400" size={18} />
              <span>{guide.language}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="text-gray-400" size={18} />
              <span>{guide.experience} years experience</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isViewingOwnGuide ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/guides/me/profile")}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition"
                >
                  Manage Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/guides/me/dashboard")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
                >
                  My Dashboard
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleBookGuide}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
              >
                Book Guide
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;