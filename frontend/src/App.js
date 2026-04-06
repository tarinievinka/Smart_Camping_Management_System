import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';
import Login from './components/user-and-identity-management/login/Login';
import SignUP from './components/user-and-identity-management/sign-up/SignUP';
import Forgot from './components/user-and-identity-management/login/Forgot';
import EditProfile from './components/user-and-identity-management/profile/EditProfile';
import AdminDashboard from './components/user-and-identity-management/profile/AdminDashboard';
import DeleteUsers from './components/user-and-identity-management/profile/DeleteUsers';
import CamperDashboard from './components/user-and-identity-management/profile/CamperDashboard';
import EquipmentDashboard from './components/equipment-management/EquipmentDashboard';
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentManagement from './components/payment-management/PaymentManagement';
import SecureCheckout from './components/payment-management/payment-checkout/SecureCheckout';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import Landing from './components/landing/Landing';
import EquipmentStore from './components/equipment-management/EquipmentStore';
import BookingSummary from './components/equipment-management/BookingSummary';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';

import Feedback from './components/feedbck-and-review-management/Feedback';
import MyReviews from './components/feedbck-and-review-management/my-reviews/MyReviews';
import AdminFeedback from './components/feedbck-and-review-management/admin-feedback/AdminFeedback';
import AdminAllReviews from './components/feedbck-and-review-management/admin-feedback/AdminAllReviews';

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <div className="min-h-screen">
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/equipment' element={<EquipmentDashboard />} />
          <Route path='/equipment-store' element={<EquipmentStore />} />
          <Route path='/booking-summary' element={<BookingSummary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUP />} />
          <Route path="/login/forgot" element={<Forgot />} />
          <Route path="/camper-dashboard" element={<CamperDashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/admin/delete-users" element={<DeleteUsers />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/payment-checkout" element={<SecureCheckout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin/payments" element={<PaymentAdminDashboard />} />
          
          {/* Feedback Routes */}
          <Route path='/feedback' element={<Feedback />} />
          <Route path='/my-reviews' element={<MyReviews />} />
          <Route path='/admin/feedback' element={<AdminFeedback />} />
          <Route path='/admin/all-reviews' element={<AdminAllReviews />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;