import React from "react";

const PaymentCard = ({ payment }) => {
  return (
    <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
      <p><strong>Booking Type:</strong> {payment.bookingType}</p>
      <p><strong>Amount:</strong> ${payment.amount}</p>
      <p><strong>Status:</strong> {payment.paymentStatus}</p>
      <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
    </div>
  );
};

export default PaymentCard;
