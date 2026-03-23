import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// 1. Import your Navbar and Footer
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';

// Importing payment management components
import EquipmentDashboard from './components/equipment-management/EquipmentDashboard';
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentManagement from './components/payment-management/PaymentManagement';
import SecureCheckout from './components/payment-management/payment-checkout/SecureCheckout';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import Landing from './components/landing/Landing';
import EquipmentStore from './components/equipment-management/EquipmentStore';
import BookingSummary from './components/equipment-management/BookingSummary';
import PaymentAdminDashboard from './components/admin/dashboard/PaymentAdminDashboard';





function App() {
  return (
    <BrowserRouter>
      {/* 2. Navbar goes here so it shows on every page */}
      <Navbar />
      
      {/* Optional: A wrapper div to ensure your page takes up at least the full screen height 
          so the footer doesn't float up on short pages */}
      <div className="min-h-screen">
        <Routes>
          <Route path='/' element={<Landing />} />
          
          <Route path='/equipment' element={<EquipmentDashboard />} />
          <Route path='/equipment-store' element={<EquipmentStore />} />
          <Route path='/booking-summary' element={<BookingSummary />} />

          <Route path='/payment' element={<PaymentForm />}>
            <Route path="/payment-form" element={<PaymentForm />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />    
            <Route path="/payment-card" element={<PaymentCard />} />  
            
            {/* gvngvg */}
            
          </Route>
        </Routes>
      </div>

      {/* 3. Footer goes here at the very bottom */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;