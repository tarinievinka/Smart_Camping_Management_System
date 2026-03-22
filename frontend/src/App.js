import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/user-and-identity-management/login/Login';
import SignUP from './components/user-and-identity-management/sign-up/SignUP';

const Landing = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Welcome to Smart Camping</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUP />} />  
          
          {/* gvngvg */}
          
       

      </Routes>
    </BrowserRouter>
  );
}

export default App;
