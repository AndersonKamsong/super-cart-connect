import { apiClient } from '@/lib/api';
import { User, AuthResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  acceptTerms: boolean;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async getProfile(): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>('/auth/profile',{});
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', data);
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    return apiClient.put<void>('/auth/change-password', data);
  },

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    return apiClient.put<void>(`/auth/reset-password/${resetToken}`, { password: newPassword });
  },
  async socialLogin(email: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/forgot-password', { email });
  },
  async verifyEmail(email: string): Promise<any> {
    return apiClient.post<any>('/auth/forgot-password', { email });
  },
  async resendVerification(email: string): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },
};