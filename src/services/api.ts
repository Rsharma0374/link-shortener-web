import axios from 'axios';
import { AuthResponse, LoginCredentials, SignupCredentials, ShortenUrlRequest, ShortenedUrl, TwoFactorAuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10008/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEncryptionKey = async () => {
  try {
    const response = await fetch(`${API_URL}/gateway/key`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const res = await response.json();
    if (res && res.sKey && res.sId) {
      sessionStorage.setItem("AES_KEY", res.sKey);
      sessionStorage.setItem("KEY_ID", res.sId);
      return res;
    }
    throw new Error('Invalid encryption key response');
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw error;
  }
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', credentials);
    return response.data;
  },

  setup2FA: async (): Promise<TwoFactorAuthResponse> => {
    const response = await api.post<TwoFactorAuthResponse>('/auth/2fa/setup');
    return response.data;
  },

  verify2FA: async (code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/2fa/verify', { code });
    return response.data;
  },
};

export const urlService = {
  shortenUrl: async (data: ShortenUrlRequest): Promise<ShortenedUrl> => {
    const response = await api.post<ShortenedUrl>('/urls/shorten', data);
    return response.data;
  },

  getUrls: async (): Promise<ShortenedUrl[]> => {
    const response = await api.get<ShortenedUrl[]>('/urls');
    return response.data;
  },

  deleteUrl: async (id: string): Promise<void> => {
    await api.delete(`/urls/${id}`);
  },
}; 