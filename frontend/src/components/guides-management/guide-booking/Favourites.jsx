import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Favourites = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favouriteGuides, setFavouriteGuides] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        setLoading(true);
        setError(null);

        const raw = localStorage.getItem("guide_favourites");
        const parsed = raw ? JSON.parse(raw) : [];
        const guideIds = new Set(Array.isArray(parsed) ? parsed : []);

        if (guideIds.size === 0) {
          setFavouriteGuides([]);
          return;
        }

        const res = await axios.get(`${API_URL}/api/guides/display`);
        const guides = Array.isArray(res.data) ? res.data : res.data?.guides || res.data?.data || [];

        setFavouriteGuides(guides.filter((g) => guideIds.has(g._id)));
      } catch {
        setError("Failed to load favourites.");
        setFavouriteGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  const removeFavourite = (guideId) => {
    try {
      const raw = localStorage.getItem("guide_favourites");
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed : [];

      const next = existing.filter((id) => id !== guideId);
      localStorage.setItem("guide_favourites", JSON.stringify(next));
      setFavouriteGuides((prev) => prev.filter((g) => g._id !== guideId));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">My Favourites</h1>

      {loading ? (
        <p className="mt-4 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-red-600">{error}</p>
      ) : favouriteGuides.length === 0 ? (
        <p className="mt-4 text-gray-500">No favourites yet.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {favouriteGuides.map((g) => (
            <div
              key={g._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900">{g.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFavourite(g._id)}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Remove favourite"
                  title="Remove favourite"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Heart size={16} className="text-red-500" fill="currentColor" />
                <span>
                  {g.language} • {g.experience} yrs
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/guides/${g._id}`)}
                className="mt-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition-colors"
              >
                View Guide Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;