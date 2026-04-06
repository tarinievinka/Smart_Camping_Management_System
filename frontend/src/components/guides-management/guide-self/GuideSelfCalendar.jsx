import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from "lucide-react";
import { getCurrentGuideId, isLoggedInAsGuide } from "./guideSession";
import { useGuideBookingsForGuide, isPendingGuideBooking } from "./useGuideBookingsForGuide";
import Sidebar from "./Sidebar";
import { useToast } from "../../../context/ToastContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

function toYmd(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function bookingCoversYmd(ymd, b) {
  const startRaw = b.startDate || b.bookedAt;
  if (!startRaw) return false;
  const startYmd = toYmd(startRaw);
  if (!startYmd) return false;
  const endYmd = b.endDate ? toYmd(b.endDate) : startYmd;
  if (!endYmd) return false;
  return ymd >= startYmd && ymd <= endYmd;
}

function formatDateRange(start, end, fallback) {
  const formatStr = (d) => new Date(d).toLocaleDateString();
  if (start && end) {
    if (new Date(start).getTime() === new Date(end).getTime()) return formatStr(start);
    return `${formatStr(start)} – ${formatStr(end)}`;
  }
  if (start) return formatStr(start);
  if (fallback) return formatStr(fallback);
  return "-";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const GuideSelfCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const currentGuideId = getCurrentGuideId();
  const loggedInAsGuide = isLoggedInAsGuide();

  const [viewDate, setViewDate] = useState(() => new Date());

  const { loading, error, upcoming, refresh } = useGuideBookingsForGuide(
    loggedInAsGuide ? currentGuideId : null
  );

  const confirmBooking = async (bookingId) => {
    if (!bookingId) return;
    try {
      await axios.put(`${API_URL}/api/guide-bookings/update/${bookingId}`, { status: "Confirmed" });
      await refresh();
      showToast("Booking confirmed.", { variant: "success" });
    } catch (e) {
      console.error(e);
      showToast("Could not confirm booking.", { variant: "error" });
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { calendarCells, monthLabel } = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({ type: "pad", key: `pad-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const ymd = toYmd(dateObj);
      const hasBooking = upcoming.some((b) => ymd && bookingCoversYmd(ymd, b));
      const isToday = (() => {
        const t = new Date();
        return (
          t.getFullYear() === year && t.getMonth() === month && t.getDate() === d
        );
      })();
      cells.push({ type: "day", day: d, ymd, hasBooking, isToday, key: `day-${d}` });
    }

    const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return { calendarCells: cells, monthLabel };
  }, [year, month, upcoming]);

  if (!loggedInAsGuide) {
    return (
      <div style={shellStyle}>
        <Sidebar currentPath={location.pathname} onNavigate={navigate} />
        <main style={{ flex: 1, padding: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Calendar</h1>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Log in as a guide to see your schedule.</p>
          <button type="button" onClick={() => navigate("/")} style={{ ...backBtnStyle, marginTop: 20 }}>
            Back to home
          </button>
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
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>Calendar</h1>
              <p style={{ color: "#9ca3af", marginTop: 4 }}>Upcoming bookings on your schedule</p>
            </div>
            <button type="button" onClick={() => navigate("/guides/owndashboard")} style={backBtnStyle}>
              Back to Dashboard <ArrowRight size={18} />
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#9ca3af" }}>Loading calendar…</p>
          ) : error ? (
            <div>
              <p style={{ color: "#dc2626" }}>{error}</p>
              <button type="button" onClick={() => refresh()} style={{ ...backBtnStyle, marginTop: 12 }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #f3f4f6",
                  padding: 28,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  marginBottom: 32,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    style={{
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      borderRadius: 10,
                      padding: 8,
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <ChevronLeft size={20} color="#374151" />
                  </button>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>{monthLabel}</h2>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    style={{
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      borderRadius: 10,
                      padding: 8,
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <ChevronRight size={20} color="#374151" />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {WEEKDAYS.map((w) => (
                    <div
                      key={w}
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                      }}
                    >
                      {w}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                  {calendarCells.map((cell) => {
                    if (cell.type === "pad") {
                      return <div key={cell.key} style={{ minHeight: 44 }} />;
                    }
                    const { day, hasBooking, isToday } = cell;
                    return (
                      <div
                        key={cell.key}
                        style={{
                          minHeight: 44,
                          borderRadius: 12,
                          border: isToday ? "2px solid #22c55e" : "1px solid #f3f4f6",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          background: hasBooking ? "#f0fdf4" : "#fafafa",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#111827",
                        }}
                        title={hasBooking ? "Has booking" : undefined}
                      >
                        <span>{day}</span>
                        {hasBooking && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#22c55e",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #f3f4f6",
                  padding: 28,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 8, color: "#111827" }}>
                  Upcoming bookings
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20 }}>
                  Trips that are still active or awaiting completion ({upcoming.length} total)
                </p>
                {upcoming.length === 0 ? (
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "48px 24px",
                      borderRadius: 16,
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: 16,
                    }}
                  >
                    No upcoming bookings.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {upcoming.map((b) => {
                      const pending = isPendingGuideBooking(b);
                      return (
                        <div
                          key={b._id || `${b.customerName}-${b.bookedAt}`}
                          style={{
                            border: "1px solid #f3f4f6",
                            borderRadius: 16,
                            padding: 20,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: "#111827" }}>{b.customerName || "Guest"}</div>
                            {pending ? (
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#b45309",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                Awaiting your confirmation
                              </div>
                            ) : (
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#15803d",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                Confirmed — mark complete when finished
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                color: "#6b7280",
                                fontSize: 14,
                                marginTop: 6,
                              }}
                            >
                              <Clock size={16} style={{ color: "#ca8a04" }} />
                              {formatDateRange(b.startDate, b.endDate, b.bookedAt)}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            {pending && b._id && (
                              <button
                                type="button"
                                onClick={() => confirmBooking(b._id)}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: 10,
                                  border: "none",
                                  background: "#16a34a",
                                  fontWeight: 600,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  color: "#fff",
                                }}
                              >
                                Confirm request
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate("/guides/ownbookings")}
                              style={{
                                padding: "8px 14px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "pointer",
                                color: "#374151",
                              }}
                            >
                              Manage in Bookings
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuideSelfCalendar;
