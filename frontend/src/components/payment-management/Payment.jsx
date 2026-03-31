import React from 'react';

import PaymentHistory from './payment-history/PaymentHistory';
import SecureCheckout from './payment-checkout/SecureCheckout'; 
import Navbar from '../../common/navbar/Navbar'; 
import Footer from '../../common/footer/Footer';




const Payment = () => {
  return (
    <div>
      <Navbar />
      <PaymentHistory />
      <SecureCheckout />
      <Footer />
    </div>
  );
};

export default Payment;