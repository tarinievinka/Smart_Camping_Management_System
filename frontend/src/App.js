import React from 'react';
import './App.css';
import Navbar from './common/navbar/Navbar';
import Footer from './common/footer/Footer';

import Landing from './components/landing/Landing';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Landing />
      </main>

      <Footer />
    </div>
  );
}

export default App;
