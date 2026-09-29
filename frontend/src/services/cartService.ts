import { apiClient } from './api';
import { Cart, CartItem } from '../types';

export const cartService = {
  async getCart(): Promise<{ cart: Cart }> {
    const res = await apiClient.get<{ cart: Cart }>('/cart');
    return res.data;
  },

  async addItem(productId: string, quantity: number = 1): Promise<{ message: string; cart: Cart }> {
    const res = await apiClient.post<{ message: string; cart: Cart }>('/cart/items', {
      product: productId,
      quantity,
    });
    return res.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<{ message: string; cartItem: CartItem }> {
    const res = await apiClient.put<{ message: string; cartItem: CartItem }>(`/cart/items/${itemId}`, {
      quantity,
    });
    return res.data;
  },

  async removeItem(itemId: string): Promise<{ message: string; cart: Cart }> {
    const res = await apiClient.delete<{ message: string; cart: Cart }>(`/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart(): Promise<{ message: string; cart: Cart }> {
    const res = await apiClient.delete<{ message: string; cart: Cart }>('/cart');
    return res.data;
  },
};
