import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';



// Payment management components
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentManagement from './components/payment-management/PaymentManagement';
import SecureCheckout from './components/payment-management/payment-checkout/SecureCheckout';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import Landing from './components/landing/Landing';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';

import Feedback from './components/feedbck-and-review-management/Feedback';
import MyReviews from './components/feedbck-and-review-management/my-reviews/MyReviews';
import AdminFeedback from './components/feedbck-and-review-management/admin-feedback/AdminFeedback';
import Landing from './components/landing/Landing';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';





function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
        <Route path="/payment-checkout" element={<SecureCheckout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin/payments" element={<PaymentAdminDashboard />} />

        {/* Feedback Routes */}
        <Route path='/feedback' element={<Feedback />} />
        <Route path='/my-reviews' element={<MyReviews />} />
        <Route path='/admin/feedback' element={<AdminFeedback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;