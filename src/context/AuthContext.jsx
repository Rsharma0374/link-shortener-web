import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const updateToken = (newToken) => {
    // Set user data when token is updated
    const username = sessionStorage.getItem('username');
    const identifier = sessionStorage.getItem('identifier');
    if (username && identifier) {
      setUser({
        id: identifier, // Using email as id since it's unique
        name: username,
        email: identifier,
        token: newToken,
        is2FAEnabled: false // Default value since we don't have this info
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 