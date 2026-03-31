import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/user-and-identity-management/login/Login';
import SignUP from './components/user-and-identity-management/sign-up/SignUP';
import Forgot from './components/user-and-identity-management/login/Forgot';
import EditProfile from './components/user-and-identity-management/profile/EditProfile';
import AdminDashboard from './components/user-and-identity-management/profile/AdminDashboard';
import DeleteUsers from './components/user-and-identity-management/profile/DeleteUsers';

import CamperDashboard from './components/user-and-identity-management/profile/CamperDashboard';


const Landing = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Welcome to Smart Camping</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUP />} />  
        <Route path="/login/forgot" element={<Forgot />} />
        <Route path="/camper-dashboard" element={<CamperDashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        <Route path="/admin/delete-users" element={<DeleteUsers />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* gvngvg */}
          
       

      </Routes>
    </BrowserRouter>
  );
}

export default App;
