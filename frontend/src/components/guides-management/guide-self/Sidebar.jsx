import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  Banknote,
  LogOut,
  Star,
  CalendarDays,
} from "lucide-react";
import { clearGuideSession } from "./guideSession";

const WildGuideLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#22c55e" />
    <path d="M6 24 L12 12 L16 18 L20 10 L26 24 Z" fill="white" opacity="0.9" />
    <path d="M6 24 L12 14 L16 20 L20 12 L26 24 Z" fill="white" />
  </svg>
);

export const guideSelfNavItems = [
  { label: "Dashboard", path: "/guides/owndashboard", icon: LayoutDashboard },
  { label: "Bookings", path: "/guides/ownbookings", icon: CalendarCheck },
  { label: "Calendar", path: "/guides/owncalendar", icon: CalendarDays },
  { label: "Earnings", path: "/guides/ownearnings", icon: Banknote },
  { label: "Reviews", path: "/guides/ownreviews", icon: Star },
];

/**
 * Guide self-service sidebar (WildGuide). Pass navigate from useNavigate as onNavigate.
 */
const Sidebar = ({ currentPath, onNavigate, onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
      return;
    }
    clearGuideSession();
    navigate("/guides");
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        padding: "28px 16px",
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, paddingLeft: 8 }}>
        <WildGuideLogo />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>WildGuide</div>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginTop: 1 }}>Guide Dashboard</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {guideSelfNavItems.map(({ label, path, icon: Icon }) => {
          const active = currentPath === path;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: active ? "#f0fdf4" : "transparent",
                color: active ? "#16a34a" : "#6b7280",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <Icon size={19} style={{ color: active ? "#22c55e" : "#9ca3af", flexShrink: 0 }} />
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, marginTop: 16 }}>
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "#ef4444",
            fontWeight: 600,
            fontSize: 14,
            width: "100%",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={19} style={{ color: "#ef4444" }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
