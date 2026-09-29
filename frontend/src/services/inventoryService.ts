import { apiClient } from './api';
import { Inventory } from '../types';

export const inventoryService = {
  async getByProductId(productId: string): Promise<{ inventory: Inventory }> {
    const res = await apiClient.get<{ inventory: Inventory }>(`/inventory/${productId}`);
    return res.data;
  },

  async update(
    productId: string,
    data: { quantity: number; reorderLevel?: number; supplier?: string }
  ): Promise<{ message: string; inventory: Inventory }> {
    const res = await apiClient.put<{ message: string; inventory: Inventory }>(`/inventory/${productId}`, data);
    return res.data;
  },

  async getLowStock(): Promise<{ products: Inventory[]; count: number }> {
    const res = await apiClient.get<{ products: Inventory[]; count: number }>('/inventory/low-stock');
    return res.data;
  },

  async getOutOfStock(): Promise<{ products: Inventory[]; count: number }> {
    const res = await apiClient.get<{ products: Inventory[]; count: number }>('/inventory/out-of-stock');
    return res.data;
  },
};
