import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider!');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [customUser, setCustomUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for custom user data in localStorage
    const checkCustomAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setCustomUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (!firebaseUser) {
        checkCustomAuth(); // Only check custom auth if no Firebase user
      }
      setLoading(false);
    });

    // Check custom auth on initial load
    checkCustomAuth();

    return unsubscribe;
  }, []);

  // Custom login function for non-Firebase authentication
  const customLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCustomUser(userData);
  };

  // Logout function for both Firebase and custom auth
  const logout = () => {
    // Clear custom auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCustomUser(null);
    
    // Firebase logout (if user is signed in with Firebase)
    if (currentUser) {
      auth.signOut();
    }
  };

  // Determine the active user and their role
  const getActiveUser = () => {
    if (customUser) {
      return {
        ...customUser,
        isCustomAuth: true
      };
    }
    
    if (currentUser) {
      return {
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        role: 'user', // Default role for Firebase users
        isCustomAuth: false
      };
    }
    
    return null;
  };

  const activeUser = getActiveUser();
  const isAuthenticated = !!(currentUser || customUser);

  const value = {
    currentUser, // Firebase user
    customUser,  // Custom authenticated user
    user: activeUser, // Active user (either Firebase or custom)
    isAuthenticated,
    loading,
    customLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};