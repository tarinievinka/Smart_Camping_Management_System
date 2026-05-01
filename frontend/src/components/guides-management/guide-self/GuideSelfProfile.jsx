import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  CheckCircle,
  Globe,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Edit
} from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";
import { getGuideDailyRate } from "../../../utils/guidePricing";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
//guide manage1 profile page - shows guide their own profile details, with option to edit (link to manageownprofile) and view stats/reviews/photos (tabs, but mostly placeholders until we connect analytics and reviews APIs)
const GuideSelfProfile = () => {
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [activeTab, setActiveTab] = useState("About");

  useEffect(() => {
    const fetchGuide = async () => {
      if (!currentGuideId) {
        setError("No guide ID found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Backend route: GET /api/guides/update/:id
        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        setGuide(res.data);
      } catch (err) {
        console.error(err);
        setGuide(null);
        setError("Failed to load your profile details.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInAsGuide && currentGuideId) {
      fetchGuide();
    } else {
      setError("Please log in as a guide to view your profile.");
      setLoading(false);
    }
  }, [currentGuideId, loggedInAsGuide]);

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Sign in from user management as a guide, or use dev env vars (see guide dashboard help text).
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
              onClick={() => navigate("/guides/owndashboard")}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Guide dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6 h-screen flex justify-center items-center">Loading...</div>;
  if (error) return <div className="p-6 h-screen flex justify-center items-center text-red-600">{error}</div>;
  if (!guide) return <div className="p-6 h-screen flex justify-center items-center">Profile not found.</div>;

  const basePrice = getGuideDailyRate(guide);
  const avatarSrc = resolveMediaUrl(guide.profilePhoto) || resolveMediaUrl(guide.coverPhoto);
  const gallery = Array.isArray(guide.gallery) ? guide.gallery : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            </div>
            <button
              onClick={() => navigate("/guides/manageownprofile")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Profile Header */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-green-800 flex items-center justify-center text-white text-3xl font-bold">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={guide.name} className="w-full h-full object-cover" />
                  ) : (
                    guide.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{guide.name}</h1>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Verified Guide</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                          NIC: {guide.nic || "—"}
                        </span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                          Age: {guide.age || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold text-gray-900">LKR {basePrice}</div>
                      <div className="text-gray-500 text-sm">per day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex">
                  {["About", "Reviews", "Photos"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-2 whitespace-nowrap text-sm font-bold border-b-[3px] transition-colors duration-200 ${
                        activeTab === tab
                          ? "text-green-600 border-green-500"
                          : "text-gray-400 border-transparent hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {activeTab === "About" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {guide.description || "Experienced guide with a passion for nature and adventure."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900">Experience</div>
                            <div className="text-sm text-gray-600">{guide.experience} years</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">Identification</div>
                            <div className="text-sm text-gray-600">NIC: {guide.nic || "—"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="font-medium text-gray-900">Certifications</div>
                            <div className="text-sm text-gray-600">
                              {guide.specialties?.length ? guide.specialties.join(", ") : "—"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900">Availability</div>
                            <div className="text-sm text-gray-600">{guide.availability ? "Available" : "Not Available"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="space-y-6">
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Reviews will appear here once you complete bookings.</p>
                    </div>
                  </div>
                )}

                {activeTab === "Photos" && (
                  <div className="space-y-6">
                    {gallery.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-gray-400 text-xl">📷</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                        <p className="text-gray-600">Add images under Edit profile → Trip Photo Gallery.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {gallery.map((url, i) => {
                          const src = resolveMediaUrl(url) || url;
                          return (
                            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <p className="text-sm text-gray-500">
                Booking totals and ratings will show here when connected to your analytics API.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm font-medium text-gray-900">{guide.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-sm font-medium text-gray-900">{guide.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideSelfProfile;