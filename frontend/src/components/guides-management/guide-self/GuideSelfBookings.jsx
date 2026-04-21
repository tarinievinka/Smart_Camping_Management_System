import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import axios from "axios";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";
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

const completedOnLabel = (b) => {
  const d = b.endDate || b.startDate || b.bookedAt;
  return d ? new Date(d).toLocaleDateString() : "-";
};

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

const GuideSelfBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const { loading, error, upcoming, completed, setEntries, refresh } =
    useGuideBookingsForGuide(loggedInAsGuide ? currentGuideId : null);

  const removeBooking = async (bookingId) => {
    try {
      await axios.delete(`${API_URL}/api/guide-bookings/cancel/${bookingId}`);
      setEntries((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error(err);
    }
  };

  const markCompleted = async (bookingId) => {
    try {
      const res = await axios.put(`${API_URL}/api/guide-bookings/update/${bookingId}`, { status: "completed" });
      setEntries((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
    } catch (err) {
      console.error(err);
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      const res = await axios.put(`${API_URL}/api/guide-bookings/update/${bookingId}`, { status: "Confirmed" });
      setEntries((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
      toast.showToast("Booking confirmed.", { variant: "success" });
    } catch (err) {
      console.error(err);
      toast.showToast("Could not confirm booking.", { variant: "error" });
    }
  };

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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>My Bookings</h1>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Log in as a guide to view your bookings.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ ...backBtnStyle, marginTop: 20 }}
          >
            Back to home
          </button>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
        >
          Loading bookings…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main style={{ flex: 1, padding: 40 }}>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <button type="button" onClick={() => refresh()} style={{ ...backBtnStyle, marginTop: 16 }}>
            Retry
          </button>
        </main>
      </div>
    );
  }

  const emptyBoxStyle = {
    background: "#f9fafb",
    padding: "80px 40px",
    borderRadius: 16,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 17,
  };

  return (
    <div style={shellStyle}>
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />

      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>My Bookings</h1>
              <p style={{ color: "#9ca3af", marginTop: 4 }}>Upcoming and completed trips for your account</p>
            </div>
            <button type="button" onClick={() => navigate("/guides/owndashboard")} style={backBtnStyle}>
              Back to Dashboard <ArrowRight size={18} />
            </button>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, marginTop: 0, color: "#111827" }}>
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <div style={emptyBoxStyle}>No upcoming bookings.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {upcoming.map((b) => {
                  const bookingId = b._id;
                  return (
                    <div
                      key={bookingId || b.customerName}
                      style={{
                        background: "#fff",
                        border: "1px solid #f3f4f6",
                        borderRadius: 16,
                        padding: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 16,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                            {b.customerName || "Guest"}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: isPendingGuideBooking(b) ? "#b45309" : "#15803d",
                            }}
                          >
                            {isPendingGuideBooking(b) ? "Awaiting your confirmation" : "Confirmed"}
                          </div>
                          <div
                            style={{
                              color: "#6b7280",
                              marginTop: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 14,
                            }}
                          >
                            <Clock size={16} style={{ color: "#ca8a04", flexShrink: 0 }} />
                            {formatDateRange(b.startDate, b.endDate, b.bookedAt)}
                          </div>
<<<<<<< HEAD
                          {b.amount != null && (
                            <div style={{ marginTop: 8, color: "#16a34a", fontSize: 15, fontWeight: 700 }}>
                              LKR {Number(b.amount).toFixed(2)}
                            </div>
                          )}
=======
>>>>>>> 0ddf5d4f6df51071b45d392a52ddc6e64c2c857e
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {isPendingGuideBooking(b) ? (
                            <button
                              type="button"
                              onClick={() => confirmBooking(bookingId)}
                              style={{
                                padding: "8px 16px",
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                              }}
                            >
                              Confirm booking
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markCompleted(bookingId)}
                              style={{
                                padding: "8px 16px",
                                background: "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                              }}
                            >
                              Mark completed
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeBooking(bookingId)}
                            aria-label="Remove booking"
                            title="Remove booking"
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              border: "1px solid #fecaca",
                              background: "#fff",
                              color: "#dc2626",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, marginTop: 0, color: "#111827" }}>
              Completed
            </h2>
            {completed.length === 0 ? (
              <div style={emptyBoxStyle}>No completed bookings yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {completed.map((b) => (
                  <div
                    key={b._id || `${b.customerName}-${b.bookedAtMs}`}
                    style={{
                      background: "#fff",
                      border: "1px solid #f3f4f6",
                      borderRadius: 16,
                      padding: 24,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                          {b.customerName || "Guest"}
                        </div>
                        <div style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                          Completed on {completedOnLabel(b)}
                        </div>
<<<<<<< HEAD
                        {b.amount != null && (
                          <div style={{ marginTop: 4, color: "#16a34a", fontSize: 15, fontWeight: 700 }}>
                            LKR {Number(b.amount).toFixed(2)}
                          </div>
                        )}
=======
>>>>>>> 0ddf5d4f6df51071b45d392a52ddc6e64c2c857e
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#16a34a",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        <CheckCircle2 size={18} />
                        Completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #f3f4f6",
  padding: 28,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

export default GuideSelfBookings;
