import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Star, MessageSquare, Calendar, User, LayoutGrid } from "lucide-react";
import axios from "axios";
import { isLoggedInAsGuide, getCurrentGuideId } from "./guideSession";
import Sidebar from "./Sidebar";

const backBtnStyle = {
  padding: "10px 20px",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  color: "#374151",
  fontSize: 14,
  transition: "all 0.2s ease"
};

const shellStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#f8f9fb",
  fontFamily: "'DM Sans', sans-serif",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #f1f5f9",
  padding: "32px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  marginBottom: "24px"
};

const statCardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: "24px",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
};

const GuideSelfReviews = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedInAsGuide();
  const guideId = getCurrentGuideId();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!guideId) return;
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/feedback/display");
        const allReviews = Array.isArray(res.data) ? res.data : [];
        
        // Filter for this guide
        const myReviews = allReviews.filter(r => 
          String(r.targetId) === String(guideId) && 
          String(r.targetType).toLowerCase() === "guide"
        );
        
        setReviews(myReviews);
      } catch (err) {
        console.error("Error fetching guide reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (loggedIn) {
      fetchReviews();
    }
  }, [guideId, loggedIn]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length
    };
  }, [reviews]);

  if (!loggedIn) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main style={{ flex: 1, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
             <div style={{ width: 80, h: 80, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#ef4444" }}>
                <LayoutGrid size={40} />
             </div>
             <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 12 }}>Access Restricted</h1>
             <p style={{ color: "#6b7280", lineHeight: 1.6 }}>Please log in as a guide to view your client reviews and feedback.</p>
             <button 
                onClick={() => navigate("/login")}
                style={{ marginTop: 24, padding: "12px 24px", background: "#166534", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}
             >
                Go to Login
             </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>Client Reviews</h1>
              <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>See what campers are saying about their expeditions with you.</p>
            </div>
            <button type="button" onClick={() => navigate("/guides/owndashboard")} style={backBtnStyle} onMouseOver={e => e.currentTarget.style.borderColor = "#166534"} onMouseOut={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
              Back to Dashboard <ArrowRight size={18} />
            </button>
          </div>

          {/* Stats Section */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={statCardStyle}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Rating</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{stats.avg}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill={i < Math.round(stats.avg) ? "#fbbf24" : "none"} color={i < Math.round(stats.avg) ? "#fbbf24" : "#e2e8f0"} />
                        ))}
                    </div>
                </div>
            </div>
            <div style={statCardStyle}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Reviews</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{stats.total}</span>
                    <MessageSquare size={24} color="#166534" />
                </div>
            </div>
          </div>

          {loading ? (
            <div style={{ py: 60, textAlign: "center" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #f3f3f3", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                <p style={{ marginTop: 16, color: "#64748b", fontWeight: 600 }}>Loading reviews...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ ...cardStyle, padding: "80px 40px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#cbd5e1" }}>
                <MessageSquare size={40} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>No reviews yet</h3>
              <p style={{ color: "#64748b", maxWidth: 400, margin: "0 auto" }}>Client feedback will appear here once campers complete their expeditions and share their experiences.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {reviews.map((rev) => (
                <div key={rev._id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534", fontWeight: 800, fontSize: 18, border: "2px solid #fff", boxShadow: "0 0 0 2px #f1f5f9" }}>
                            {rev.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>{rev.userName || "Verified Camper"}</h4>
                            <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < rev.rating ? "#fbbf24" : "none"} color={i < rev.rating ? "#fbbf24" : "#e2e8f0"} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
                        <Calendar size={14} />
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{rev.title || "Expedition Review"}</h5>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                    "{rev.comment}"
                  </p>

                  {rev.imageUrls && rev.imageUrls.length > 0 && (
                    <div style={{ display: "flex", gap: 12, marginTop: 20, overflowX: "auto", pb: 8 }}>
                        {rev.imageUrls.map((url, i) => (
                            <div key={i} style={{ width: 120, height: 80, borderRadius: 12, overflow: "hidden", border: "1px solid #f1f5f9", flexShrink: 0 }}>
                                <img src={`http://localhost:5000${url}`} alt="Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuideSelfReviews;
