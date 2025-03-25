export interface User {
  id: string;
  email: string;
  name: string;
  is2FAEnabled: boolean;
}

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortUrl: string;
  validateDate: string;
  createdAt: string;
  userId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export interface TwoFactorAuthResponse {
  qrCode: string;
  secret: string;
}

export interface ShortenUrlRequest {
  longUrl: string;
  validateDate: string;
} 