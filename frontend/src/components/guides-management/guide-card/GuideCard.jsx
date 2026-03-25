import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Globe,
  Clock,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GuideCard = ({ guide, onDelete, role = "user" }) => {
  const navigate = useNavigate();

  // ✅ CARD CLICK → GO TO PROFILE
  const handleCardClick = () => {
    if (role === "user") {
      navigate(`/guides/${guide._id}`);
    }
  };

  // ✅ DELETE
  const handleDelete = async (e) => {
    e.stopPropagation(); // ⭐ IMPORTANT
    if (!window.confirm(`Delete ${guide.name}?`)) return;

    try {
      await axios.delete(`${API_URL}/api/guides/${guide._id}`);
      if (onDelete) onDelete(guide._id);
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ✅ EDIT → UPDATE PAGE ONLY
  const handleEdit = (e) => {
    e.stopPropagation(); // ⭐ IMPORTANT
    navigate(`/guides/update/${guide._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow hover:shadow-lg p-5 cursor-pointer"
    >
      <div className="flex justify-between mb-3">
        <h2 className="font-bold">{guide.name}</h2>

        {guide.availability ? (
          <span className="text-green-600 flex gap-1 items-center">
            <CheckCircle size={14} /> Available
          </span>
        ) : (
          <span className="text-red-500 flex gap-1 items-center">
            <XCircle size={14} /> Unavailable
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">{guide.description}</p>

      <div className="text-sm space-y-1">
        <div className="flex gap-2"><Mail size={14}/> {guide.email}</div>
        <div className="flex gap-2"><Phone size={14}/> {guide.phone}</div>
        <div className="flex gap-2"><Clock size={14}/> {guide.experience} years</div>
        <div className="flex gap-2"><Globe size={14}/> {guide.language}</div>
      </div>

      {/* ✅ ONLY ADMIN / GUIDE */}
      {role !== "user" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEdit}
            className="flex-1 bg-green-100 text-green-700 p-2 rounded"
          >
            <Edit3 size={14}/> Edit
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-100 text-red-600 p-2 rounded"
          >
            <Trash2 size={14}/> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default GuideCard;