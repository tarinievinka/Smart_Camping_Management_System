import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";
import { useGuideBookingsForGuide } from "./useGuideBookingsForGuide";
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

const GuideSelfEarnings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const { loading, normalized, completed: completedBookings } = useGuideBookingsForGuide(
    loggedInAsGuide ? currentGuideId : null
  );

  const computed = useMemo(() => {
    const pending = normalized.filter((b) => b.computedStatus === "upcoming").length;
    const completed = completedBookings.length;

    const earnings = completedBookings.reduce((sum, b) => {
      const amount = typeof b?.amount === "number" ? b.amount : 0;
      return sum + amount * 0.9;
    }, 0);

    return { pending, completed, earnings, count: normalized.length };
  }, [normalized, completedBookings]);

  const shellStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "#f8f9fb",
    fontFamily: "'DM Sans', sans-serif",
  };

  if (!loggedInAsGuide) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main style={{ flex: 1, overflowY: "auto", padding: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Earnings</h1>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Log in as a guide to view your earnings.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />

      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Earnings</h1>
              <p style={{ color: "#9ca3af", marginTop: 4 }}>Based on your actual booking data</p>
            </div>
            <button type="button" onClick={() => navigate("/guides/owndashboard")} style={backBtnStyle}>
              Back to Dashboard <ArrowRight size={18} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#6b7280" }}>
              <Loader2 className="animate-spin" size={20} />
              <span>Loading earnings data...</span>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div style={statCard}>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Total Bookings</div>
                  <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: "#111827" }}>{computed.count}</div>
                </div>

                <div style={statCard}>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Upcoming / Pending</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#eab308", marginTop: 8 }}>{computed.pending}</div>
                </div>

                <div style={statCard}>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Completed</div>
                  <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: "#111827" }}>{computed.completed}</div>
                </div>
              </div>

              <div style={earningsCard}>
                <div style={{ fontSize: 16, color: "#6b7280", marginBottom: 8 }}>Total Earnings</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#16a34a" }}>LKR {computed.earnings.toFixed(2)}</div>
                <p style={{ marginTop: 16, color: "#9ca3af", fontSize: 14, lineHeight: 1.6 }}>
                  This is calculated strictly from bookings that have been finalized and completed.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const statCard = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #f3f4f6",
  padding: "28px 32px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const earningsCard = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #f3f4f6",
  padding: 40,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

export default GuideSelfEarnings;
