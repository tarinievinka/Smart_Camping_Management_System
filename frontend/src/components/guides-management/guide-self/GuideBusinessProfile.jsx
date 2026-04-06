import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Camera, X, CheckCircle2, Plus, Upload, UserCircle, Banknote, MapPinned } from "lucide-react";
import { isLoggedInAsGuide, getCurrentGuideId, clearGuideSession } from "./guideSession";
import Sidebar from "./Sidebar";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";
import { uploadGuideImageFile } from "../../../api/guideUploadApi";
import ImageCropModal from "./ImageCropModal";
import { useToast } from "../../../context/ToastContext";
import { localTodayYmd } from "../../../utils/dateInputMin";

function isoToLocalYmd(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GEAR_TEMPLATE = [
  { name: "Camping Tents", checked: false },
  { name: "Cooking Gear", checked: false },
  { name: "Backpacks", checked: false },
  { name: "First Aid Kits", checked: false },
  { name: "Sleeping Bags", checked: false },
  { name: "Water Filters", checked: false },
];

const GuideBusinessProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const loggedInAsGuide = isLoggedInAsGuide();
  const currentGuideId = getCurrentGuideId();

  const coverFileRef = useRef(null);
  const galleryFileRef = useRef(null);
  const profileFileRef = useRef(null);

  const [guideName, setGuideName] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const suggestedTags = ["Family Camping", "Mountain Climbing", "Tracking", "First Aid Certified"];

  const [gear, setGear] = useState(() => GEAR_TEMPLATE.map((g) => ({ ...g })));

  const [rate, setRate] = useState("120");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [gallery, setGallery] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [availableAgainYmd, setAvailableAgainYmd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [cropModal, setCropModal] = useState(null);
  const [pastTours, setPastTours] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillDraft, setSkillDraft] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!loggedInAsGuide) {
        setIsLoading(false);
        return;
      }
      try {
        if (!currentGuideId) return;
        const res = await axios.get(`${API_URL}/api/guides/update/${currentGuideId}`);
        const data = res.data;
        if (data) {
          setGuideName(data.name || "");
          setBio(data.description || "");
          if (data.coverPhoto) setCoverPhoto(data.coverPhoto);
          if (data.profilePhoto) setProfilePhoto(data.profilePhoto);
          if (data.specialties?.length) setSpecialties(data.specialties);
          if (data.gear?.length > 0) {
            const mergedGear = GEAR_TEMPLATE.map((g) => {
              const found = data.gear.find((dbG) => dbG.name === g.name);
              return found ? { ...found } : { ...g };
            });
            setGear(mergedGear);
          } else {
            setGear(GEAR_TEMPLATE.map((g) => ({ ...g })));
          }
          if (data.gallery?.length) setGallery(data.gallery);
          if (data.dailyRate != null) setRate(String(data.dailyRate));
          setIsPaused(data.isPaused || false);
          setAvailableAgainYmd(isoToLocalYmd(data.availableAgainAt));
          if (Array.isArray(data.pastTours) && data.pastTours.length > 0) {
            setPastTours(
              data.pastTours.map((t) => ({
                title: t.title || "",
                summary: t.summary || "",
              }))
            );
          } else {
            setPastTours([]);
          }
          if (Array.isArray(data.skills) && data.skills.length > 0) {
            setSkills(data.skills.map((s) => String(s)));
          } else {
            setSkills([]);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [currentGuideId, loggedInAsGuide]);

  const handleSave = async () => {
    if (!currentGuideId) {
      showToast("No guide account in session.", { variant: "error" });
      return;
    }
    try {
      await axios.put(`${API_URL}/api/guides/update/${currentGuideId}`, {
        name: guideName,
        description: bio,
        coverPhoto,
        profilePhoto,
        specialties,
        gear,
        gallery,
        pastTours: pastTours.filter((t) => (t.title || "").trim() || (t.summary || "").trim()),
        skills,
        dailyRate: Number(rate),
        isPaused,
        availableAgainAt:
          isPaused && availableAgainYmd.trim()
            ? new Date(`${availableAgainYmd.trim()}T12:00:00`).toISOString()
            : null,
      });
      showToast("Profile saved.", { variant: "success", duration: 6000 });
    } catch {
      showToast("Failed to save profile.", { variant: "error" });
    }
  };

  const closeCropModal = () => {
    if (cropModal?.src) URL.revokeObjectURL(cropModal.src);
    setCropModal(null);
  };

  const handleImageFilePick = (e, kind) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const src = URL.createObjectURL(file);
    const aspect = kind === "cover" ? 16 / 9 : 1;
    setCropModal({ src, kind, aspect });
  };

  const handleCroppedFile = async (file) => {
    if (!cropModal) return;
    const { kind } = cropModal;
    setUploadBusy(true);
    try {
      const urlPath = await uploadGuideImageFile(file);
      if (kind === "cover") setCoverPhoto(urlPath);
      else if (kind === "profile") setProfilePhoto(urlPath);
      else if (kind === "gallery") {
        setGallery((prev) => (prev.length >= 4 ? prev : [...prev, urlPath]));
      }
      closeCropModal();
    } catch (err) {
      console.error(err);
      showToast("Image upload failed. Use a JPEG/PNG/WebP under 5MB.", { variant: "error" });
    } finally {
      setUploadBusy(false);
    }
  };

  const handleSignOut = () => {
    clearGuideSession();
    navigate("/guides");
  };

  const openCoverPicker = () => coverFileRef.current?.click();
  const openGalleryPicker = () => {
    if (gallery.length >= 4) {
      showToast("Max 4 photos allowed.", { variant: "info" });
      return;
    }
    galleryFileRef.current?.click();
  };
  const openProfilePicker = () => profileFileRef.current?.click();

  const addSpecialty = (tag) => {
    if (!specialties.includes(tag)) setSpecialties([...specialties, tag]);
  };
  const removeSpecialty = (tag) => setSpecialties(specialties.filter((t) => t !== tag));
  const addSkill = () => {
    const t = skillDraft.trim();
    if (!t || skills.includes(t)) return;
    setSkills([...skills, t]);
    setSkillDraft("");
  };
  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));
  const addPastTourRow = () => setPastTours([...pastTours, { title: "", summary: "" }]);
  const updatePastTour = (idx, field, value) => {
    const next = [...pastTours];
    next[idx] = { ...next[idx], [field]: value };
    setPastTours(next);
  };
  const removePastTour = (idx) => setPastTours(pastTours.filter((_, i) => i !== idx));
  const toggleGear = (idx) => {
    const g = [...gear];
    g[idx].checked = !g[idx].checked;
    setGear(g);
  };

  const rateValue = Number(rate) || 0;
  const serviceFee = rateValue * 0.1;
  const youEarn = rateValue * 0.9;

  if (!loggedInAsGuide) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Access Denied</h1>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>Please log in as a guide to manage your profile.</p>
          <button
            type="button"
            onClick={() => navigate("/guides")}
            style={{
              padding: "10px 24px",
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Guide Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fb",
          fontFamily: "'DM Sans', sans-serif",
          color: "#6b7280",
        }}
      >
        Loading profile…
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8f9fb",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Sidebar currentPath={location.pathname} onNavigate={navigate} onSignOut={handleSignOut} />

      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 80px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 32,
            }}
          >
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>
                Guide Business Profile
              </h2>
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>
                Edit how clients see your business on the WildGuide platform.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate(`/guides/${currentGuideId}`)}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Preview Profile
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: "10px 20px",
                  background: "#22c55e",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>

          <input
            ref={coverFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={(e) => handleImageFilePick(e, "cover")}
          />
          <input
            ref={galleryFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={(e) => handleImageFilePick(e, "gallery")}
          />
          <input
            ref={profileFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={(e) => handleImageFilePick(e, "profile")}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={openCoverPicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openCoverPicker();
            }}
            style={{
              position: "relative",
              height: 260,
              borderRadius: 24,
              overflow: "hidden",
              marginBottom: 36,
              cursor: uploadBusy ? "wait" : "pointer",
              background: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
            }}
          >
            {resolveMediaUrl(coverPhoto) ? (
              <img src={resolveMediaUrl(coverPhoto)} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.28)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Camera size={22} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{uploadBusy ? "Uploading…" : "Upload cover image"}</span>
              <span style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Crop after choose • JPEG / PNG / WebP, max 5MB</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 24 }}>
              <section style={card}>
                <SectionTitle icon={<UserCircle size={18} color="#22c55e" />} title="About Me" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={openProfilePicker}
                      disabled={uploadBusy}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        border: "3px solid #e5e7eb",
                        overflow: "hidden",
                        cursor: uploadBusy ? "wait" : "pointer",
                        padding: 0,
                        background: "#f3f4f6",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {resolveMediaUrl(profilePhoto) ? (
                        <img
                          src={resolveMediaUrl(profilePhoto)}
                          alt="Profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 28, fontWeight: 700, color: "#9ca3af" }}>
                          {(guideName || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={openProfilePicker}
                        disabled={uploadBusy}
                        style={{
                          padding: "8px 16px",
                          background: "#111827",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: uploadBusy ? "wait" : "pointer",
                        }}
                      >
                        Upload profile photo
                      </button>
                      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, marginBottom: 0 }}>
                        Crop after choose • Shown on your public profile and listings.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input value={guideName} onChange={(e) => setGuideName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Professional Bio</label>
                    <textarea
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe your experience and what makes your tours special."
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    />
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                      Briefly describe your experience and what makes your tours special.
                    </p>
                  </div>
                </div>
              </section>

              <section style={card}>
                <SectionTitle icon={<span style={{ color: "#22c55e", fontSize: 18 }}>🛡</span>} title="Specialties & Skills" />
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
                  Select the tags that best describe your expertise. These help clients find you.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {specialties.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: "#f0fdf4",
                        color: "#16a34a",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          color: "#16a34a",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSpecialty(tag)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        color: "#6b7280",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </section>

              <section style={card}>
                <SectionTitle icon={<span style={{ color: "#22c55e", fontSize: 18 }}>⚡</span>} title="Additional skills" />
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
                  Shown on your public profile (e.g. First aid, GPS navigation). Separate from specialty tags.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          color: "#1d4ed8",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#1d4ed8",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              </section>

              <section style={card}>
                <SectionTitle icon={<span style={{ color: "#22c55e", fontSize: 18 }}>🎒</span>} title="Gear Included" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {gear.map((item, idx) => (
                    <div
                      key={item.name}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleGear(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleGear(idx);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: "1px solid #f3f4f6",
                        cursor: "pointer",
                        background: item.checked ? "#f0fdf4" : "#fff",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: item.checked ? "#22c55e" : "transparent",
                          border: item.checked ? "none" : "2px solid #d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.checked && <CheckCircle2 size={14} color="#fff" fill="#22c55e" />}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: item.checked ? "#111827" : "#6b7280",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPinned size={18} color="#22c55e" /> Past tours
                  </h3>
                  <button
                    type="button"
                    onClick={addPastTourRow}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    + Add tour
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
                  Highlights clients see under Past Tours on your public profile.
                </p>
                {pastTours.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#9ca3af" }}>No past tours yet — add one to build trust.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {pastTours.map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: "1px solid #f3f4f6",
                          borderRadius: 14,
                          padding: 16,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Tour {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePastTour(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          placeholder="Title (e.g. Knuckles range trek)"
                          value={row.title}
                          onChange={(e) => updatePastTour(idx, "title", e.target.value)}
                          style={inputStyle}
                        />
                        <textarea
                          placeholder="Short summary"
                          rows={2}
                          value={row.summary}
                          onChange={(e) => updatePastTour(idx, "summary", e.target.value)}
                          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Trip Photo Gallery</h3>
                  <button
                    type="button"
                    onClick={openGalleryPicker}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      background: "#111827",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={14} /> Upload Photos
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
                  Show potential clients the amazing experiences you&apos;ve led.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {gallery.map((url, i) => (
                    <div key={url + i} style={{ aspectRatio: "1", borderRadius: 16, overflow: "hidden", position: "relative" }}>
                      <img
                        src={resolveMediaUrl(url) || url}
                        alt={`Trip ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGallery(gallery.filter((_, j) => j !== i));
                        }}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#ef4444",
                          border: "none",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#fff",
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {gallery.length < 4 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={openGalleryPicker}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openGalleryPicker();
                      }}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 16,
                        border: "2px dashed #e5e7eb",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#9ca3af",
                        transition: "all 0.2s",
                      }}
                    >
                      <Plus size={22} style={{ marginBottom: 6 }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Add Photo</span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <section style={card}>
                <SectionTitle icon={<Banknote size={18} color="#22c55e" />} title="Daily Rate" />
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontWeight: 700,
                      color: "#111827",
                      fontSize: 15,
                    }}
                  >
                    LKR
                  </span>
                  <input
                    type="text"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 60, fontSize: 22, fontWeight: 800 }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
                  Avg. rate for your specialty is LKR 500 – LKR 145
                </p>
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9ca3af" }}>
                    <span>Platform Fee (10%)</span>
                    <span>LKR {serviceFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#111827" }}>
                    <span>You Earn</span>
                    <span>LKR {youEarn.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              <section style={card}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Profile Status</h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isPaused ? "#fff7ed" : "#f0fdf4",
                    border: `1px solid ${isPaused ? "#fed7aa" : "#bbf7d0"}`,
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: isPaused ? "#f97316" : "#22c55e",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isPaused ? "#c2410c" : "#15803d",
                      }}
                    >
                      {isPaused ? "Paused & Hidden" : "Live & Booking"}
                    </span>
                  </div>
                  <CheckCircle2 size={17} color={isPaused ? "#f97316" : "#22c55e"} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaused((p) => {
                      const next = !p;
                      if (next === false) setAvailableAgainYmd("");
                      return next;
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  {isPaused ? "Reactivate Profile" : "Pause Profile"}
                </button>
                {isPaused && (
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Expected available again (optional)</label>
                    <input
                      type="date"
                      value={availableAgainYmd}
                      min={localTodayYmd()}
                      onChange={(e) => setAvailableAgainYmd(e.target.value)}
                      style={{ ...inputStyle, marginTop: 4 }}
                    />
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
                      If admin also marks you unavailable, guests see this date on your card. Leave blank if unknown.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <footer
            style={{
              marginTop: 48,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Need help with your profile?{" "}
              <a href="#" style={{ color: "#16a34a", fontWeight: 600 }}>
                Visit Support Center
              </a>
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: "9px 20px",
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Save Profile
              </button>
            </div>
          </footer>
        </div>
      </main>

      {cropModal && (
        <ImageCropModal
          imageSrc={cropModal.src}
          aspect={cropModal.aspect}
          title={
            cropModal.kind === "cover"
              ? "Crop cover photo"
              : cropModal.kind === "profile"
                ? "Crop profile photo"
                : "Crop gallery photo"
          }
          onCancel={closeCropModal}
          onComplete={handleCroppedFile}
          busy={uploadBusy}
        />
      )}
    </div>
  );
};

const card = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #f3f4f6",
  padding: 28,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  background: "#fff",
};

const SectionTitle = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
    {icon}
    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h3>
  </div>
);

export default GuideBusinessProfile;
