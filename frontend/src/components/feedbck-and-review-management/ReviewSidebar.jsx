import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, Heart, LogOut } from 'lucide-react';

const ReviewSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shrink-0 hidden lg:flex">
      <div className="flex items-center gap-3 mb-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ backgroundColor: "#166534" }}
        >
          P
        </div>
        <div>
          <h2 className="text-gray-900 font-bold text-lg">WildGuide</h2>
          <p className="text-gray-500 text-xs">Adventure awaits</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {[
          { icon: LayoutGrid, label: "Browse Guides", path: "/guides" },
          { icon: Calendar, label: "My Bookings", path: "/guides/bookings" },
          { icon: Heart, label: "Favorites", path: "/guides/favourites" },
        ].map((item) => {
          // If we are currently on the feedback form or my reviews, no tab is explicitly active in this mockup.
          // BUT if they sent the image with "Browse Guides" active, we can leave the active state mapping or default it.
          // In the image, 'Browse Guides' is active. We will highlight it if path matches, else standard.
          const isActive = location.pathname === item.path || (item.label === 'Browse Guides' && false); // Let it be normal routing active state
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
              style={isActive ? { backgroundColor: "#166534" } : {}}
            >
              <item.icon size={18} /> {item.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("auth_session");
          navigate('/login');
        }}
        className="flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors mt-auto"
      >
        <LogOut size={18} className="rotate-180" /> Sign Out
      </button>
    </aside>
  );
};

export default ReviewSidebar;
