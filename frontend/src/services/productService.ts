import { apiClient } from './api';
import { Product, Pagination } from '../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean | string;
  sort?: string;
  college?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductDetailResponse {
  product: Product;
  inventory?: import('../types').Inventory;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  sku: string;
  location?: string;
  tags?: string[];
  images?: Array<{ url: string; alt?: string }>;
}

export type ProductStatus = 'Available' | 'Already Rented' | 'Unavailable';

export interface CampusEntry {
  college: string;
  count: number;
}

export const productService = {
  async getAll(params?: ProductFilters): Promise<ProductListResponse> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          cleanParams[key] = val;
        }
      });
    }
    const res = await apiClient.get<ProductListResponse>('/products', { params: cleanParams });
    return res.data;
  },

  async getById(id: string): Promise<ProductDetailResponse> {
    const res = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
    return res.data;
  },

  async getMyListings(): Promise<{ products: Product[]; count: number }> {
    const res = await apiClient.get<{ products: Product[]; count: number }>('/products/user/my-listings');
    return res.data;
  },

  async getCampuses(): Promise<{ campuses: CampusEntry[] }> {
    const res = await apiClient.get<{ campuses: CampusEntry[] }>('/products/campuses');
    return res.data;
  },

  async create(data: ProductPayload): Promise<{ message: string; product: Product }> {
    const res = await apiClient.post<{ message: string; product: Product }>('/products', data);
    return res.data;
  },

  async update(id: string, data: Partial<ProductPayload>): Promise<{ message: string; product: Product }> {
    const res = await apiClient.put<{ message: string; product: Product }>(`/products/${id}`, data);
    return res.data;
  },

  async updateStatus(id: string, status: ProductStatus): Promise<{ message: string; product: Product }> {
    const res = await apiClient.patch<{ message: string; product: Product }>(`/products/${id}/status`, { status });
    return res.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/products/${id}`);
    return res.data;
  },
};

