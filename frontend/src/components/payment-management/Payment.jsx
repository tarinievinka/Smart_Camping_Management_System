import React from 'react';

import PaymentHistory from './payment-history/PaymentHistory';
import SecureCheckout from './payment-checkout/SecureCheckout'; 

import Footer from '../../common/footer/Footer';




const Payment = () => {
  return (
    <div>

      <PaymentHistory />
      <SecureCheckout />
      <Footer />
    </div>
  );
};

export default Payment;