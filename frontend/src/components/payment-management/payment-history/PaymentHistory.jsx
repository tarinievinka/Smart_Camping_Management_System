import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentCard from "../payment-card/PaymentCard";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/payments"
        );

        setPayments(response.data);
        setLoading(false);

      } catch (err) {
        setError("Failed to load payments");
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Payment History</h2>

      {payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        payments.map((payment) => (
          <PaymentCard key={payment._id} payment={payment} />
        ))
      )}
    </div>
  );
};

export default PaymentHistory;
