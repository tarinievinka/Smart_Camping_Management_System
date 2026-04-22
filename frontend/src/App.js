import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';
import { useLocation } from 'react-router-dom';
import Login from './components/user-and-identity-management/login/Login';
import SignUP from './components/user-and-identity-management/sign-up/SignUP';
import Forgot from './components/user-and-identity-management/login/Forgot';
import ForgotRequest from './components/user-and-identity-management/login/ForgotRequest';
import EditProfile from './components/user-and-identity-management/profile/EditProfile';
import AdminDashboard from './components/user-and-identity-management/profile/AdminDashboard';
import DeleteUsers from './components/user-and-identity-management/profile/DeleteUsers';
import CamperDashboard from './components/user-and-identity-management/profile/CamperDashboard';
import AdminOwnerManagement from './components/admin/AdminOwnerManagement';
import ProtectedRoute from './components/user-and-identity-management/ProtectedRoute';

// Payment management components
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentManagement from './components/payment-management/PaymentManagement';
import SecureCheckout from './components/payment-management/payment-checkout/SecureCheckout';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';
import BankSlipAdminDashboard from './components/admin/dashboard/BankSlipAdminDashboard';
import PaymentFailure from './components/payment-management/payment-failure/PaymentFailure';
import PaymentCard from './components/payment-management/payment-card/PaymentCard';

import Feedback from './components/feedbck-and-review-management/Feedback';
import MyReviews from './components/feedbck-and-review-management/my-reviews/MyReviews';
import AdminFeedback from './components/feedbck-and-review-management/admin-feedback/AdminFeedback';
import AdminAllReviews from './components/feedbck-and-review-management/admin-feedback/AdminAllReviews';

// Equipment management components
import EquipmentStore from './components/equipment-management/EquipmentStore';
import BookingSummary from './components/equipment-management/BookingSummary';
import EquipmentDashboard from './components/equipment-management/EquipmentDashboard';
import AddEquipment from './components/equipment-management/AddEquipment';
import EditEquipment from './components/equipment-management/EditEquipment';
import EquipmentList from './components/equipment-management/EquipmentList';
import NotifyRequests from './components/equipment-management/NotifyRequests';
import EquipmentBookings from './components/equipment-management/EquipmentBookings';

// Landing page
import Landing from './components/landing/Landing';
import { ToastProvider } from './context/ToastContext';

// Importing guides management components
import GuideBooking from './components/guides-management/guide-booking/GuideBooking';
import Bookings from './components/guides-management/guide-booking/Bookings';
import Favourites from './components/guides-management/guide-booking/Favourites';
import GuideDashboard from './components/guides-management/guide-dashboard/GuideDashboard';
import AddGuide from './components/guides-management/guide-forms/AddGuide';
import UpdateGuide from './components/guides-management/guide-forms/UpdateGuide';
import GuideProfile from './components/guides-management/guide-booking/GuideProfile';
import ManageTrip from './components/guides-management/guide-booking/ManageTrip';
import GuideBusinessProfile from './components/guides-management/guide-self/GuideBusinessProfile';
import GuideSelfDashboard from './components/guides-management/guide-self/GuideSelfDashboard';
import GuideSelfBookings from './components/guides-management/guide-self/GuideSelfBookings';
import GuideSelfProfile from './components/guides-management/guide-self/GuideSelfProfile';
import GuideSelfEarnings from './components/guides-management/guide-self/GuideSelfEarnings';
import GuideSelfCalendar from './components/guides-management/guide-self/GuideSelfCalendar';
import GuideSelfReviews from './components/guides-management/guide-self/GuideSelfReviews';

// Blogs page
import Blogs from './components/blogs/Blogs';

// Guide Login Redirect
import GuideLoginRedirect from './components/guides-management/guide-self/GuideLoginRedirect';

// Campsite Management
import CampingSitesManagement from './components/camping-sites-management/CampingSitesManagement';
import CampsiteAdminContainer from './components/camping-sites-management/CampsiteAdminContainer';
import CampsiteOwnerDashboard from './components/camping-sites-management/CampsiteOwnerDashboard';
import SafetyAnalysis from './components/safety-analysis/SafetyAnalysis';
import GuideFeedback from './components/feedbck-and-review-management/Guide-review/guide-feedback';
import EquipmentFeedback from './components/feedbck-and-review-management/Equipment-review/EquipmentFeedback';
<<<<<<< HEAD
import CampsiteFeedback from './components/feedbck-and-review-management/CampsiteOwner-review/Campsite-feedback';
=======
import CampsiteBookingForm from './components/camping-sites-management/CampsiteBookingForm';
>>>>>>> 8b7cdde7cdf1dfc45b30c7096d90d7496bb8931c




function AppContent() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Paths where Footer should NOT be shown
  const hideFooterPaths = [
    '/login',
    '/signup',
    '/login/forgot',
    '/login/forgot-request'
  ];

  const isAdminPath = path.startsWith('/admin') || 
                      path.includes('dashboard') || 
                      path === '/payment-management' ||
                      path === '/campsites-admin' ||
                      path.startsWith('/guides/dashboard') ||
                      path.startsWith('/guides/add') ||
                      path.startsWith('/guides/update') ||
                      path.startsWith('/equipment-dashboard') ||
                      path.startsWith('/equipment-list') ||
                      path.startsWith('/add-equipment') ||
                      path.startsWith('/edit-equipment');

  const isGuidePath = path.startsWith('/guides') || 
                      path.startsWith('/guide-') ||
                      path === '/safety-analysis';

  const shouldHideFooter = hideFooterPaths.includes(path) || isAdminPath || isGuidePath;

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUP />} />
          <Route path="/login/forgot" element={<Forgot />} />
          <Route path="/login/forgot-request" element={<ForgotRequest />} />
          <Route path="/camper-dashboard" element={<ProtectedRoute allowedRoles={['camper']}><CamperDashboard /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute allowedRoles={['camper', 'admin', 'guide', 'owner']}><EditProfile /></ProtectedRoute>} />
          <Route path="/admin/delete-users" element={<ProtectedRoute allowedRoles={['admin']}><DeleteUsers /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/owner-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminOwnerManagement /></ProtectedRoute>} />
          
          {/* Payment management routes */}
          <Route path="/payment-history" element={<ProtectedRoute allowedRoles={['camper']}><PaymentHistory /></ProtectedRoute>} />
          <Route path="/payment-management" element={<ProtectedRoute allowedRoles={['admin']}><PaymentManagement /></ProtectedRoute>} />
          <Route path="/payment-checkout" element={<ProtectedRoute allowedRoles={['camper']}><SecureCheckout /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['camper']}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-failure" element={<ProtectedRoute allowedRoles={['camper']}><PaymentFailure /></ProtectedRoute>} />
          <Route path="/payment-card" element={<ProtectedRoute allowedRoles={['camper']}><PaymentCard /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><PaymentAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bank-slips" element={<ProtectedRoute allowedRoles={['admin']}><BankSlipAdminDashboard /></ProtectedRoute>} />
          
          {/* Feedback Routes */}
          <Route path='/feedback' element={<Feedback />} />
          <Route path='/feedbackreview' element={<Feedback />} />
          <Route path='/my-reviews' element={<ProtectedRoute allowedRoles={['camper']}><MyReviews /></ProtectedRoute>} />
          <Route path='/admin/feedback' element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedback /></ProtectedRoute>} />
          <Route path='/admin/all-reviews' element={<ProtectedRoute allowedRoles={['admin']}><AdminAllReviews /></ProtectedRoute>} />
          <Route path='/guide-feedback' element={<ProtectedRoute allowedRoles={['camper']}><GuideFeedback /></ProtectedRoute>} />
          <Route path='/equipment-feedback' element={<ProtectedRoute allowedRoles={['camper']}><EquipmentFeedback /></ProtectedRoute>} />

          {/* Equipment management routes */}
          <Route path="/equipment-store" element={<EquipmentStore />} />
          <Route path="/booking-summary" element={<ProtectedRoute allowedRoles={['camper']}><BookingSummary /></ProtectedRoute>} />
          <Route path="/equipment-bookings" element={<ProtectedRoute allowedRoles={['camper']}><EquipmentBookings /></ProtectedRoute>} />
          <Route path="/equipment-dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EquipmentDashboard /></ProtectedRoute>} />
          <Route path="/equipment-list" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EquipmentList /></ProtectedRoute>} />
          <Route path="/add-equipment" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AddEquipment /></ProtectedRoute>} />
          <Route path="/edit-equipment/:id" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EditEquipment /></ProtectedRoute>} />
          <Route path="/notify-requests" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><NotifyRequests /></ProtectedRoute>} />

          {/* Guide Management Routes */}
          <Route path='/guides' element={<GuideBooking />} />
          <Route path='/guides/bookings' element={<ProtectedRoute allowedRoles={['camper']}><Bookings /></ProtectedRoute>} />
          <Route path='/guides/favourites' element={<ProtectedRoute allowedRoles={['camper']}><Favourites /></ProtectedRoute>} />
          <Route path='/guides/manage-trip/:id' element={<ProtectedRoute allowedRoles={['guide']}><ManageTrip /></ProtectedRoute>} />
          <Route path='/guides/dashboard' element={<ProtectedRoute allowedRoles={['admin']}><GuideDashboard /></ProtectedRoute>} />
          <Route path='/guides/add' element={<ProtectedRoute allowedRoles={['admin']}><AddGuide /></ProtectedRoute>} />
          <Route path='/guides/update/:id' element={<ProtectedRoute allowedRoles={['admin']}><UpdateGuide /></ProtectedRoute>} />
          <Route path='/guides/manageownprofile' element={<ProtectedRoute allowedRoles={['guide']}><GuideBusinessProfile /></ProtectedRoute>} />
          <Route path='/guides/ownprofile' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfProfile /></ProtectedRoute>} />
          <Route path='/guides/owndashboard' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfDashboard /></ProtectedRoute>} />
          <Route path='/guides/ownbookings' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfBookings /></ProtectedRoute>} />
          <Route path='/guides/ownearnings' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfEarnings /></ProtectedRoute>} />
          <Route path='/guides/owncalendar' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfCalendar /></ProtectedRoute>} />
          <Route path='/guides/ownreviews' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfReviews /></ProtectedRoute>} />
          <Route path='/guides/:id' element={<GuideProfile />} />
          <Route path='/guide-profile' element={<ProtectedRoute allowedRoles={['guide']}><GuideLoginRedirect /></ProtectedRoute>} />

          {/* Campsite Routes */}
          <Route path="/campsites" element={<CampingSitesManagement />} />
          <Route path="/campsite-booking/:id" element={<ProtectedRoute allowedRoles={['camper']}><CampsiteBookingForm /></ProtectedRoute>} />
          <Route path="/campsites-admin" element={<ProtectedRoute allowedRoles={['admin']}><CampsiteAdminContainer /></ProtectedRoute>} />
          <Route path="/owner-profile" element={<ProtectedRoute allowedRoles={['owner']}><CampsiteOwnerDashboard /></ProtectedRoute>} />
          <Route path="/safety-analysis" element={<SafetyAnalysis />} />
        </Routes>
      </div>
      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
<<<<<<< HEAD
        <Navbar />

        <div className="min-h-screen">
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/blogs' element={<Blogs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUP />} />
            <Route path="/login/forgot" element={<Forgot />} />
            <Route path="/login/forgot-request" element={<ForgotRequest />} />
            <Route path="/camper-dashboard" element={<ProtectedRoute allowedRoles={['camper']}><CamperDashboard /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute allowedRoles={['camper', 'admin', 'guide', 'owner']}><EditProfile /></ProtectedRoute>} />
            <Route path="/admin/delete-users" element={<ProtectedRoute allowedRoles={['admin']}><DeleteUsers /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/owner-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminOwnerManagement /></ProtectedRoute>} />
            
            {/* Payment management routes */}
            <Route path="/payment-history" element={<ProtectedRoute allowedRoles={['camper']}><PaymentHistory /></ProtectedRoute>} />
            <Route path="/payment-management" element={<ProtectedRoute allowedRoles={['admin']}><PaymentManagement /></ProtectedRoute>} />
            <Route path="/payment-checkout" element={<ProtectedRoute allowedRoles={['camper']}><SecureCheckout /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['camper']}><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/payment-failure" element={<ProtectedRoute allowedRoles={['camper']}><PaymentFailure /></ProtectedRoute>} />
            <Route path="/payment-card" element={<ProtectedRoute allowedRoles={['camper']}><PaymentCard /></ProtectedRoute>} />
             <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><PaymentAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/bank-slips" element={<ProtectedRoute allowedRoles={['admin']}><BankSlipAdminDashboard /></ProtectedRoute>} />
            
            {/* Feedback Routes */}
            <Route path='/feedback' element={<Feedback />} />
            <Route path='/feedbackreview' element={<Feedback />} />
            <Route path='/my-reviews' element={<ProtectedRoute allowedRoles={['camper']}><MyReviews /></ProtectedRoute>} />
            <Route path='/admin/feedback' element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedback /></ProtectedRoute>} />
            <Route path='/admin/all-reviews' element={<ProtectedRoute allowedRoles={['admin']}><AdminAllReviews /></ProtectedRoute>} />
            <Route path='/guide-feedback' element={<ProtectedRoute allowedRoles={['camper']}><GuideFeedback /></ProtectedRoute>} />
            <Route path='/equipment-feedback' element={<ProtectedRoute allowedRoles={['camper']}><EquipmentFeedback /></ProtectedRoute>} />
            <Route path='/campsite-feedback' element={<ProtectedRoute allowedRoles={['camper']}><CampsiteFeedback /></ProtectedRoute>} />


            {/* Equipment management routes */}
            <Route path="/equipment-store" element={<EquipmentStore />} />
            <Route path="/booking-summary" element={<ProtectedRoute allowedRoles={['camper']}><BookingSummary /></ProtectedRoute>} />
            <Route path="/equipment-bookings" element={<ProtectedRoute allowedRoles={['camper']}><EquipmentBookings /></ProtectedRoute>} />
            <Route path="/equipment-dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EquipmentDashboard /></ProtectedRoute>} />
            <Route path="/equipment-list" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EquipmentList /></ProtectedRoute>} />
            <Route path="/add-equipment" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AddEquipment /></ProtectedRoute>} />
            <Route path="/edit-equipment/:id" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EditEquipment /></ProtectedRoute>} />
            <Route path="/notify-requests" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><NotifyRequests /></ProtectedRoute>} />

            {/* Guide Management Routes */}
            <Route path='/guides' element={<GuideBooking />} />
            <Route path='/guides/bookings' element={<ProtectedRoute allowedRoles={['camper']}><Bookings /></ProtectedRoute>} />
            <Route path='/guides/favourites' element={<ProtectedRoute allowedRoles={['camper']}><Favourites /></ProtectedRoute>} />
            <Route path='/guides/manage-trip/:id' element={<ProtectedRoute allowedRoles={['guide']}><ManageTrip /></ProtectedRoute>} />
            <Route path='/guides/dashboard' element={<ProtectedRoute allowedRoles={['admin']}><GuideDashboard /></ProtectedRoute>} />
            <Route path='/guides/add' element={<ProtectedRoute allowedRoles={['admin']}><AddGuide /></ProtectedRoute>} />
            <Route path='/guides/update/:id' element={<ProtectedRoute allowedRoles={['admin']}><UpdateGuide /></ProtectedRoute>} />
            <Route path='/guides/manageownprofile' element={<ProtectedRoute allowedRoles={['guide']}><GuideBusinessProfile /></ProtectedRoute>} />
            <Route path='/guides/ownprofile' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfProfile /></ProtectedRoute>} />
            <Route path='/guides/owndashboard' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfDashboard /></ProtectedRoute>} />
            <Route path='/guides/ownbookings' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfBookings /></ProtectedRoute>} />
            <Route path='/guides/ownearnings' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfEarnings /></ProtectedRoute>} />
            <Route path='/guides/owncalendar' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfCalendar /></ProtectedRoute>} />
            <Route path='/guides/ownreviews' element={<ProtectedRoute allowedRoles={['guide']}><GuideSelfReviews /></ProtectedRoute>} />
            <Route path='/guides/:id' element={<GuideProfile />} />
            <Route path='/guide-profile' element={<ProtectedRoute allowedRoles={['guide']}><GuideLoginRedirect /></ProtectedRoute>} />

            
            {/* Campsite Routes */}
            <Route path="/campsites" element={<CampingSitesManagement />} />
            <Route path="/campsite-booking/:id" element={<ProtectedRoute allowedRoles={['camper']}><CampsiteBookingForm /></ProtectedRoute>} />
            <Route path="/campsites-admin" element={<ProtectedRoute allowedRoles={['admin']}><CampsiteAdminContainer /></ProtectedRoute>} />
            <Route path="/owner-profile" element={<ProtectedRoute allowedRoles={['owner']}><CampsiteOwnerDashboard /></ProtectedRoute>} />
            <Route path="/safety-analysis" element={<SafetyAnalysis />} />

          </Routes>
        </div>
        <Footer />
=======
        <AppContent />
>>>>>>> 83692b7d97c7503d8c8029036b8e0336c544aa0f
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;