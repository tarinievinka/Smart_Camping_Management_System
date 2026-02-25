import React from 'react';
import PaymentForm from './payment-form/PaymentForm';
import PaymentHistory from './payment-history/PaymentHistory';
import PaymentSuccess from './payment-success/PaymentSuccess';
import PaymentFailure from './payment-failure/PaymentFailure';
import PaymentCard from './payment-card/PaymentCard';
import Navbar from '../../common/navbar/Navbar'; 
import Footer from '../../common/footer/Footer';




const Payment = () => {
  return (
    <div>
      <Navbar />
      
      <Footer />
    </div>
  );
}