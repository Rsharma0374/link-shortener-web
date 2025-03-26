import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';
import { socketService } from '../services/socket';
import { getEncryptionKey } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setup2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (code: string) => Promise<void>;
  updateToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      // This would typically be done with a /me endpoint
      setLoading(false);
      setToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Add effect to clear session storage on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear session storage if user is not authenticated
      if (!user) {
        sessionStorage.clear();
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]); // Add user as dependency

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const response: AuthResponse = await authService.signup({ name, email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    setToken(response.token);
    socketService.connect(response.token);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    sessionStorage.clear();
    socketService.disconnect();
    try {
      await getEncryptionKey();
    } catch (error) {
      console.error('Failed to get encryption key:', error);
    }
  };

  const setup2FA = async () => {
    return await authService.setup2FA();
  };

  const verify2FA = async (code: string) => {
    const response: AuthResponse = await authService.verify2FA(code);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    setToken(response.token);
    socketService.connect(response.token);
  };

  const updateToken = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        signup,
        logout,
        setup2FA,
        verify2FA,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 