import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Importing payment management components
import PaymentHistory from './components/payment-management/payment-history/PaymentHistory';
import PaymentForm from './components/payment-management/payment-form/PaymentForm';
import PaymentSuccess from './components/payment-management/payment-success/PaymentSuccess';
import PaymentFailure from './components/payment-management/payment-failure/PaymentFailure';  
import PaymentCard from './components/payment-management/payment-card/PaymentCard';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path='/payment'
          element={<PaymentForm />}>
          <Route path="/payment-form" element={<PaymentForm />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />    
          <Route path="/payment-card" element={<PaymentCard />} />  
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
