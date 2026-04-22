import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PenSquare, User } from "lucide-react";
import FeedbackForm from "./feedback-form/FeedbackForm";
import ReviewSidebar from "./ReviewSidebar";

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEquipmentFeedbackPage =
    location.pathname === "/feedbackreview" || location.state?.targetType === "equipment";

  return (
    <div className="min-h-screen bg-white flex">
      {!isEquipmentFeedbackPage && <ReviewSidebar />}
      <div className="flex-1 h-screen overflow-y-auto">
        {!isEquipmentFeedbackPage && (
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div></div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm self-end sm:self-auto">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-slate-900 shadow-sm border border-slate-200 pointer-events-none`}
                >
                  <PenSquare size={16} />
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/my-reviews")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-600 hover:text-slate-900 hover:bg-white`}
                >
                  <User size={16} />
                  My Reviews
                </button>
              </div>
            </div>
          </div>
        )}

        <FeedbackForm />
      </div>
    </div>
  );
};

export default Feedback;
