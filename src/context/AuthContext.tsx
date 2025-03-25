import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setup2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      // This would typically be done with a /me endpoint
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authService.login({ email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    socketService.connect(response.token);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response: AuthResponse = await authService.signup({ name, email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    socketService.connect(response.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    socketService.disconnect();
  };

  const setup2FA = async () => {
    return await authService.setup2FA();
  };

  const verify2FA = async (code: string) => {
    const response: AuthResponse = await authService.verify2FA(code);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    socketService.connect(response.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        setup2FA,
        verify2FA,
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