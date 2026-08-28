import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (fullName: string, email: string, password: string, role: string = 'USER'): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      full_name: fullName,
      email,
      password,
      role
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      email,
      reset_token: resetToken,
      new_password: newPassword
    });
    return response.data;
  }
};
