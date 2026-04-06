import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isLoggedInAsGuide } from "./guideSession";
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
};

const shellStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#f8f9fb",
  fontFamily: "'DM Sans', sans-serif",
};

/** Placeholder until reviews are wired to the API */
const GuideSelfReviews = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedInAsGuide();

  if (!loggedIn) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main style={{ flex: 1, padding: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Reviews</h1>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Log in as a guide to see reviews.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Reviews</h1>
              <p style={{ color: "#9ca3af", marginTop: 4 }}>Client feedback will appear here after merge</p>
            </div>
            <button type="button" onClick={() => navigate("/guides/owndashboard")} style={backBtnStyle}>
              Back to Dashboard <ArrowRight size={18} />
            </button>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #f3f4f6",
              padding: 48,
              textAlign: "center",
              color: "#9ca3af",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            No reviews to show yet. Connect your user-management login and review API when ready.
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuideSelfReviews;
