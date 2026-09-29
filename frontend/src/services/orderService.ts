import { apiClient } from './api';
import { Order, Pagination, ShippingAddress } from '../types';

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  cartItemId?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

export const orderService = {
  async create(data: CreateOrderPayload): Promise<{ message: string; order: Order }> {
    const res = await apiClient.post<{ message: string; order: Order }>('/orders', data);
    return res.data;
  },

  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<OrderListResponse> {
    const res = await apiClient.get<OrderListResponse>('/orders', { params });
    return res.data;
  },

  async getById(id: string): Promise<{ order: Order }> {
    const res = await apiClient.get<{ order: Order }>(`/orders/${id}`);
    return res.data;
  },

  async updateStatus(
    id: string,
    data: { status?: string; paymentStatus?: string }
  ): Promise<{ message: string; order: Order }> {
    const res = await apiClient.patch<{ message: string; order: Order }>(`/orders/${id}/status`, data);
    return res.data;
  },

  async cancelOrder(id: string): Promise<{ message: string; order: Order }> {
    const res = await apiClient.patch<{ message: string; order: Order }>(`/orders/${id}/cancel`);
    return res.data;
  },
};
