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

export interface LoginResponse {
  oBody: {
    payLoad: {
      sStatus: string;
      sResponse: string;
      sOtpToken: string;
      sUsername: string;
    };
  };
  aError?: Array<{
    sMessage: string;
  }>;
}

export interface OTPResponse {
  oBody: {
    payLoad: {
      sStatus: string;
      sResponse: string;
      sToken: string;
      sEncryptedValue: string;
    };
  };
  aError?: Array<{
    sMessage: string;
  }>;
} 