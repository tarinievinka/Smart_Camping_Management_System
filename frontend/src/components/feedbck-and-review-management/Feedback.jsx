import React from "react";
import Footer from "../../common/footer/Footer";
import FeedbackForm from "./feedback-form/FeedbackForm";

const Feedback = () => {
  return (
    <>
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 min-h-screen">
        {/* Top section: Submit Feedback Form */}
        <section className="pt-8 pb-12">
          <FeedbackForm />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Feedback;
