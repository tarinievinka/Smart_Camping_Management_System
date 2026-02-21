import React, { useState } from "react";
import axios from "axios";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    bookingType: "CampsiteBooking",
    bookingId: "",
    amount: "",
    paymentMethod: "card"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookingId || !formData.amount) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/payments/create",
        {
          userId: "YOUR_USER_ID", // Replace with logged-in user ID later
          bookingType: formData.bookingType,
          bookingId: formData.bookingId,
          amount: formData.amount,
          paymentMethod: formData.paymentMethod
        }
      );

      setMessage("Payment initiated successfully!");
      console.log(response.data);

      // Reset form
      setFormData({
        bookingType: "CampsiteBooking",
        bookingId: "",
        amount: "",
        paymentMethod: "card"
      });

    } catch (err) {
      setError("Payment failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Make a Payment</h2>

      <form onSubmit={handleSubmit}>

        {/* Booking Type */}
        <div>
          <label>Booking Type:</label>
          <select
            name="bookingType"
            value={formData.bookingType}
            onChange={handleChange}
          >
            <option value="CampsiteBooking">Campsite</option>
            <option value="EquipmentBooking">Equipment</option>
            <option value="GuideBooking">Guide</option>
          </select>
        </div>

        {/* Booking ID */}
        <div>
          <label>Booking ID:</label>
          <input
            type="text"
            name="bookingId"
            value={formData.bookingId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label>Payment Method:</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="online">Online Banking</option>
          </select>
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default PaymentForm;
