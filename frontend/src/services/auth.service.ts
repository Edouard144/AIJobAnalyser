// Auth service - handles authentication API calls
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

export const authService = {
  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/register', { fullName, email, password });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/login', { email, password });
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return api.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  },

  async getMe(): Promise<{ userId: string }> {
    return api.get<{ userId: string }>('/api/auth/me');
  },
};
