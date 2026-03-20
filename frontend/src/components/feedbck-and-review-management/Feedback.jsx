import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../../common/footer/Footer";
import FeedbackForm from "./feedback-form/FeedbackForm";
import { Star, MessageCircle, MapPin } from "lucide-react";

const Feedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/feedback/display");
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching public reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Top section: Submit Feedback Form */}
        <section className="pt-8 pb-12">
          <FeedbackForm />
        </section>

        {/* Bottom section: Public Reviews */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center gap-3 mb-10 border-b border-gray-200 pb-4">
            <MessageCircle className="text-green-600 w-8 h-8" />
            <h2 className="text-3xl font-extrabold text-gray-800">Camper Reviews</h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
              Loading adventures...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <p className="text-xl text-gray-600 font-medium mb-2">No reviews yet.</p>
              <p className="text-gray-400">Be the first camper to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <MapPin size={12} /> {review.targetType || 'Campsite'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`${
                          star <= (review.rating || 5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-transparent text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                    "{review.comment || review.description}"
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                      {review.userId ? String(review.userId).substring(0,2).toUpperCase() : 'CA'}
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Verified Camper</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Feedback;