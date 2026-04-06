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

// Payment management components
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentManagement from './components/payment-management/PaymentManagement';
import SecureCheckout from './components/payment-management/payment-checkout/SecureCheckout';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';

// Equipment management components
import EquipmentStore from './components/equipment-management/EquipmentStore';
import BookingSummary from './components/equipment-management/BookingSummary';
import EquipmentDashboard from './components/equipment-management/EquipmentDashboard';
import AddEquipment from './components/equipment-management/AddEquipment';
import EditEquipment from './components/equipment-management/EditEquipment';
import EquipmentList from './components/equipment-management/EquipmentList';
import NotifyRequests from './components/equipment-management/NotifyRequests';

// Landing page
import Landing from './components/landing/Landing';

// Blogs page
import Blogs from './components/blogs/Blogs';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="min-h-screen">
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUP />} />
          <Route path="/login/forgot" element={<Forgot />} />
          <Route path="/camper-dashboard" element={<CamperDashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/admin/delete-users" element={<DeleteUsers />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Payment management routes */}
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/payment-checkout" element={<SecureCheckout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin/payments" element={<PaymentAdminDashboard />} />

          {/* Equipment management routes */}
          <Route path="/equipment-store" element={<EquipmentStore />} />
          <Route path="/booking-summary/:id" element={<BookingSummary />} />
          <Route path="/equipment-dashboard" element={<EquipmentDashboard />} />
          <Route path="/equipment-list" element={<EquipmentList />} />
          <Route path="/add-equipment" element={<AddEquipment />} />
          <Route path="/edit-equipment/:id" element={<EditEquipment />} />
          <Route path="/notify-requests" element={<NotifyRequests />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;