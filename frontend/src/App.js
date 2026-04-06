import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Importing payment management components
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentForm from './components/payment-management/payment-form/PaymentForm';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import PaymentFailure from './components/payment-management/payment-failure/PaymentFailure';
import PaymentCard from './components/payment-management/payment-card/PaymentCard';
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



function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route
          path='/payment'
          element={<PaymentForm />}>
          <Route path="/payment-form" element={<PaymentForm />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/payment-card" element={<PaymentCard />} />


        </Route>

        {/* Guide Management Routes */}
        <Route path='/guides' element={<GuideBooking />} />
        <Route path='/guides/bookings' element={<Bookings />} />
        <Route path='/guides/favourites' element={<Favourites />} />
        <Route path='/guides/manage-trip/:id' element={<ManageTrip />} />
        <Route path='/guides/dashboard' element={<GuideDashboard />} />
        <Route path='/guides/add' element={<AddGuide />} />
        <Route path='/guides/update/:id' element={<UpdateGuide />} />
        <Route path='/guides/manageownprofile' element={<GuideBusinessProfile />} />
        <Route path='/guides/ownprofile' element={<GuideSelfProfile />} />
        <Route path='/guides/owndashboard' element={<GuideSelfDashboard />} />
        <Route path='/guides/ownbookings' element={<GuideSelfBookings />} />
        <Route path='/guides/ownearnings' element={<GuideSelfEarnings />} />
        <Route path='/guides/owncalendar' element={<GuideSelfCalendar />} />
        <Route path='/guides/ownreviews' element={<GuideSelfReviews />} />
        <Route path='/guides/:id' element={<GuideProfile />} />

      </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
