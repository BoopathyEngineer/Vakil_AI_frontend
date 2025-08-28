"use client";

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import Cookies from "js-cookie";
import useAuthStore from '../../store/authStore';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 900000; 

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ user: '', role: '' });
  const [loading, setLoading] = useState(true);
  const clearState = useAuthStore((state) => state.clearState);
  const router = useRouter();

  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    // Check for authentication cookie when the component mounts
    const token = Cookies.get('authToken')
    
    if (token) {
      const user = Cookies.get('user');
      const role = Cookies.get('role');
      if (user && role) {
        setIsAuthenticated(true);
        setUser({ user, role });
      }
    }

    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const now = new Date().getTime();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        logout(); 
      } else {
        resetInactivityTimer(); 
      }
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser({ user: userData.user, role: userData.role });
    localStorage.setItem('lastActivity', new Date().getTime()); 
    resetInactivityTimer();
  };

  const logout = () => {
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    window.removeEventListener('keydown', handleUserActivity);
  
    clearTimeout(inactivityTimerRef.current);
  
    setIsAuthenticated(false);
  
    Cookies.remove('authToken');  
    Cookies.remove('role');
    Cookies.remove('university');
    Cookies.remove('user');  
    Cookies.remove('userId');
    Cookies.remove('chatId');
  
    clearState();
    localStorage.removeItem('auth-store');
    localStorage.removeItem('lastActivity');
  
    router.replace('/');
  };  

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {      
      logout();
    }, INACTIVITY_TIMEOUT);
  };
  const handleUserActivity = () => {
    localStorage.setItem('lastActivity', new Date().getTime());
    resetInactivityTimer(); 
  };

  useEffect(() => {

    // Monitor user activity globally
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetInactivityTimer(); // Start the timer when the app loads

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);