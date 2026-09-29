import { apiClient } from './api';

export interface AIChatResponse {
  success: boolean;
  message: string;
}

export const aiService = {
  async chat(message: string): Promise<AIChatResponse> {
    const res = await apiClient.post<AIChatResponse>('/ai/chat', { message });
    return res.data;
  },
};
