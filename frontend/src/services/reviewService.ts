import { apiClient } from './api';
import { Review, Pagination } from '../types';

export interface ReviewPayload {
  rating: number;
  title: string;
  comment: string;
}

export const reviewService = {
  async getByProductId(
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ reviews: Review[]; pagination: Pagination }> {
    const res = await apiClient.get<{ reviews: Review[]; pagination: Pagination }>(
      `/products/${productId}/reviews`,
      { params }
    );
    return res.data;
  },

  async create(productId: string, data: ReviewPayload): Promise<{ message: string; review: Review }> {
    const res = await apiClient.post<{ message: string; review: Review }>(
      `/products/${productId}/reviews`,
      data
    );
    return res.data;
  },

  async update(reviewId: string, data: Partial<ReviewPayload>): Promise<{ message: string; review: Review }> {
    const res = await apiClient.put<{ message: string; review: Review }>(`/reviews/${reviewId}`, data);
    return res.data;
  },

  async delete(reviewId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/reviews/${reviewId}`);
    return res.data;
  },
};
