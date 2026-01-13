import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setParticipant(response.data.participant);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('participant');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    localStorage.setItem('sessionToken', response.data.sessionToken);
    setParticipant(response.data.participant);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('participant');
      setParticipant(null);
    }
  };

  const updateParticipant = async (updates) => {
    // Update local state immediately
    setParticipant((prev) => ({ ...prev, ...updates }));
    
    // Fetch fresh data from server to ensure sync
    try {
      const response = await api.get('/auth/me');
      setParticipant(response.data.participant);
    } catch (error) {
      console.error('Failed to refresh participant data:', error);
    }
  };

  const value = {
    participant,
    loading,
    login,
    logout,
    updateParticipant,
    isAuthenticated: !!participant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
