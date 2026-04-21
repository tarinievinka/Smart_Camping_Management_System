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

        <FeedbackForm />
      </div>
    </div>
  );
};

export default Feedback;
