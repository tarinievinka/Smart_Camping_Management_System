import React from 'react';
import './App.css';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';

import Landing from './components/landing/Landing';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
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
          
          {/* gvngvg */}
          
        </Route>

     <BrowserRouter

      <Footer />
    </div>
  );
}

export default App;
