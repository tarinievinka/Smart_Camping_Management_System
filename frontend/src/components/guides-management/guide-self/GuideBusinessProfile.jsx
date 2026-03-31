import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, X, CheckCircle2, Lock } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const pricePerDayFromExperience = (experience) => {
  const exp = typeof experience === "number" ? experience : Number(experience || 0);
  return 80 + exp * 15;
};

const GuideBusinessProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guide, setGuide] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    language: "",
    availability: true,
    description: "",
  });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentGuideId) return;

        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        setGuide(res.data);
        setForm({
          name: res.data?.name || "",
          email: res.data?.email || "",
          phone: res.data?.phone || "",
          experience: res.data?.experience ?? "",
          language: res.data?.language || "",
          availability: res.data?.availability ?? true,
          description: res.data?.description || "",
        });
      } catch (err) {
        setError("Failed to load profile.");
        setGuide(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [currentGuideId]);

  const dailyRate = useMemo(() => pricePerDayFromExperience(form.experience), [form.experience]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (!currentGuideId) return;

      await axios.put(`${API_URL}/api/guides/update/${currentGuideId}`, {
        ...form,
        experience: Number(form.experience),
      });

      // Refresh local copy
      const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
      setGuide(res.data);
      setForm({
        name: res.data?.name || "",
        email: res.data?.email || "",
        phone: res.data?.phone || "",
        experience: res.data?.experience ?? "",
        language: res.data?.language || "",
        availability: res.data?.availability ?? true,
        description: res.data?.description || "",
      });
    } catch (err) {
      setError("Failed to save changes.");
      console.error(err);
    }
  };

  const handlePauseToggle = async () => {
    try {
      setError(null);
      if (!currentGuideId) return;

      await axios.put(`${API_URL}/api/guides/update/${currentGuideId}`, {
        ...form,
        availability: !form.availability,
        experience: Number(form.experience),
      });

      const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
      setGuide(res.data);
      setForm({
        name: res.data?.name || "",
        email: res.data?.email || "",
        phone: res.data?.phone || "",
        experience: res.data?.experience ?? "",
        language: res.data?.language || "",
        availability: res.data?.availability ?? true,
        description: res.data?.description || "",
      });
    } catch (err) {
      setError("Failed to update profile status.");
      console.error(err);
    }
  };

  if (!loggedInAsGuide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Guide Profile</h1>
        <p className="text-gray-600">Login as a guide to manage your business profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-gray-600">
          No guide account selected. Your guide session is missing.
        </p>
      </div>
    );
  }

  const sidebarItems = [
    { label: "Dashboard", path: "/guides/me/dashboard" },
    { label: "Manage Profile", path: "/guides/me/profile" },
    { label: "Bookings", path: "/guides/me/bookings" },
    { label: "Messages", path: "/guides/me/messages" },
    { label: "Earnings", path: "/guides/me/earnings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-green-600 p-1.5 rounded-lg text-white font-bold">WG</div>
          <h1 className="text-xl font-bold">WildGuide</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-green-50 text-green-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("auth_session");
            localStorage.removeItem("role");
            localStorage.removeItem("guideId");
            localStorage.removeItem("loggedInGuideId");
            localStorage.removeItem("currentGuideId");
            navigate("/guides");
          }}
          className="text-red-500 mt-auto flex items-center gap-2 px-4 py-2"
        >
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Guide Business Profile</h2>
            <p className="text-gray-500">Edit how clients see your business on the platform.</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/guides/${currentGuideId}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              Preview Profile
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </header>

        {error ? <p className="text-red-600 mb-4">{error}</p> : null}

        {/* Cover Photo (placeholder UI) */}
        <div className="relative h-64 bg-gray-200 rounded-2xl mb-8 overflow-hidden group">
          <img
            src="/api/placeholder/1200/400"
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            <div className="bg-white/80 p-3 rounded-full mb-2">
              <Camera size={24} />
            </div>
            <p className="font-semibold text-gray-700">Update Profile Cover</p>
            <p className="text-sm text-gray-500 text-center">Recommended: 1920x800px or larger</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4">About Me</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Professional Bio</label>
                  <textarea
                    rows="4"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Language</label>
                    <input
                      type="text"
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4">Specialties & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {/* This is UI-only until you add specialties to the backend */}
                {["Wildlife Photography", "Survival Skills", "Night Hiking"].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold"
                  >
                    {tag} <X size={14} className="cursor-pointer" />
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["+ Family Camping", "+ Mountain Climbing", "+ Tracking"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-500 hover:bg-gray-50"
                    onClick={() => {}}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Status/Price */}
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Daily Rate</h3>
                <span className="text-green-500 text-xs">$</span>
              </div>
              <div className="relative mb-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span>
                <input
                  type="text"
                  readOnly
                  value={Math.round(dailyRate)}
                  className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg font-bold text-xl bg-gray-50"
                />
              </div>
              <p className="text-[10px] text-gray-400 mb-4">
                Avg. rate for your experience is estimated based on your years of experience.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Service Fee (10%)</span>
                  <span>${(dailyRate * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>You Earn</span>
                  <span>${(dailyRate * 0.9).toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4">Profile Status</h3>

              <div className="flex items-center justify-between w-full p-3 bg-green-50 text-green-700 rounded-lg mb-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> Live & Booking
                </span>
                <CheckCircle2 size={16} />
              </div>

              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Lock size={16} /> Availability
                </p>
                <span className="text-sm font-semibold text-gray-700">
                  {form.availability ? "Available" : "Paused"}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePauseToggle}
                className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {form.availability ? "Pause Profile" : "Resume Profile"}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuideBusinessProfile;

