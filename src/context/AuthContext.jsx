// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import apiService from '../Services/api';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const currentUser = apiService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

    const login = async (credentials) => {
    try {
        const result = await apiService.login(credentials);

        if (result.data.success) {
        setUser(result.data.user);
        }

        return { success: true, data: result.data };
    } catch (error) {
        // Only return structured response for known API errors (401, 422, etc.)
        if (error.response) {
        return {
            success: false,
            data: error.response.data || { message: 'Login failed' },
        };
        }

        // For true network/unknown errors → throw
        throw error;
    }
    };


  const register = async (userData) => {
    try {
      const result = await apiService.register(userData);
      if (result.data.success) {
        setPendingVerification(userData.contact_number);
        
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const result = await apiService.verifyOTP(phoneNumber, otp);
      if (result.data.success) {
        setUser(result.data.user);
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setPendingVerification(null);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setPendingVerification(null);
  };

  const value = {
    user,
    login,
    register,
    verifyOTP,
    logout,
    loading,
    pendingVerification,
    setPendingVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};