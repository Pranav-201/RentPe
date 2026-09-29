import { apiClient } from './api';
import { Product } from '../types';

export interface SmartSearchResultItem {
  requirement: string;
  found: boolean;
  products: Product[];
}

export interface AIChatResponse {
  success: boolean;
  message: string;
  isSmartSearch?: boolean;
  results?: SmartSearchResultItem[];
}

export const aiService = {
  async chat(message: string, isSmartSearch: boolean = false): Promise<AIChatResponse> {
    const res = await apiClient.post<AIChatResponse>('/ai/chat', {
      message,
      smartSearch: isSmartSearch
    });
    return res.data;
  },
};

