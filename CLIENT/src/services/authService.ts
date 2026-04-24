import api from './api';
import type { AuthResponse, ApiResponse, User } from '../types';

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    adminCode?: string
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      adminCode,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/auth/verify-email/${token}`);
    return response.data;
  },

  resendVerification: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/resend-verification');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
