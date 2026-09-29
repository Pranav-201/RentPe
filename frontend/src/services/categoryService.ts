import { apiClient } from './api';
import { Category, Pagination } from '../types';

export interface CategoryPayload {
  name: string;
  description?: string;
  image?: {
    url?: string;
    alt?: string;
  };
}

export const categoryService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<{ categories: Category[]; pagination: Pagination }> {
    const res = await apiClient.get<{ categories: Category[]; pagination: Pagination }>('/categories', { params });
    return res.data;
  },

  async getById(id: string): Promise<{ category: Category }> {
    const res = await apiClient.get<{ category: Category }>(`/categories/${id}`);
    return res.data;
  },

  async create(data: CategoryPayload): Promise<{ message: string; category: Category }> {
    const res = await apiClient.post<{ message: string; category: Category }>('/categories', data);
    return res.data;
  },

  async update(id: string, data: Partial<CategoryPayload>): Promise<{ message: string; category: Category }> {
    const res = await apiClient.put<{ message: string; category: Category }>(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};
