import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getAuthToken, persistAuthSession, clearAuthSession } from '../utils/authToken';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const token = getAuthToken(parsed);
        if (token) {
          const synced = persistAuthSession(parsed, token);
          setUser(synced);
        } else {
          clearAuthSession();
        }
      } catch {
        clearAuthSession();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const { data } = await axios.post(`${apiUrl}/api/login`, {
      email: username,
      password,
    });
    const userInfo = persistAuthSession(data.user, data.token);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (username, email, password, role = 'user', phone = '') => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const { data } = await axios.post(`${apiUrl}/api/register`, {
      name: username,
      email,
      password,
      role,
      phone,
    });
    const userInfo = persistAuthSession(data.user, data.token);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
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
