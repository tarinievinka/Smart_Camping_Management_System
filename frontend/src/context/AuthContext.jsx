import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user object on load
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await axios.post('/api/login', { username, password });
    const userInfo = { ...data.user, token: data.token }; // Flatten
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    return userInfo;
  };

  const register = async (username, email, password, role = 'user', phone = '') => {
    const { data } = await axios.post('/api/register', { username, email, password, role, phone });
    const userInfo = { ...data.user, token: data.token }; // Flatten
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('equipment_cart_guest');
  };

  const value = {
    user,
    setUser, // Added to allow external sync
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
