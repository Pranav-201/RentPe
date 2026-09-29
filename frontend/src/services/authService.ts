import { apiClient } from './api';
import { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  collegeId: string;
  collegeName: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const res = await apiClient.put<{ message: string; user: User }>('/auth/profile', data);
    return res.data;
  },
};
