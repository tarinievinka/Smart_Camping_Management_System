import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/user-and-identity-management/Header';
import Footer from './components/user-and-identity-management/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import CampsiteList from './pages/CampsiteList';
import CampsiteDetails from './pages/CampsiteDetails';
import AdminDashboard from './pages/AdminDashboard';
import CampsiteOwnerDashboard from './components/camping-sites-management/CampsiteOwnerDashboard';
import MyBookings from './pages/MyBookings';


function AppContent() {
  const location = useLocation();
  const authPaths = ['/login', '/login/forgot', '/register'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/campsites" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/forgot" element={<Forgot />} />
        <Route path="/register" element={<Register />} />
        <Route path="/campsites" element={<CampsiteList />} />
        <Route path="/campsites/:id" element={<CampsiteDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/owner" element={<CampsiteOwnerDashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
