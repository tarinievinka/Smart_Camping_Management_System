import React from "react";
import FeedbackForm from "./feedback-form/FeedbackForm";

const Feedback = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 h-screen overflow-y-auto">

        <FeedbackForm />
      </div>
    </div>
  );
};

export default Feedback;
