import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  language?: string;
  theme?: string;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  plan?: string;
  usageCount?: string;
}

export interface OTPResponse {
  otpSent: boolean;
}

export interface VerifyOTPResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  verified: boolean;
}

export const authService = {
  async register(firstName: string, lastName: string, email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/register', { firstName, lastName, email, password });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/login', { email, password });
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return api.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  },

  async getMe(): Promise<UserProfile> {
    return api.get<UserProfile>('/api/auth/me');
  },

  // Profile updates (language, theme, onboarding)
  async updateProfile(data: { language?: string; theme?: string; onboardingCompleted?: boolean }): Promise<UserProfile> {
    return api.patch<UserProfile>('/api/auth/me', data);
  },

  // Email OTP verification
  async sendOTP(email: string): Promise<OTPResponse> {
    return api.post<OTPResponse>('/api/auth/send-otp', { email });
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    return api.post<VerifyOTPResponse>('/api/auth/verify-otp', { email, otp });
  },
};