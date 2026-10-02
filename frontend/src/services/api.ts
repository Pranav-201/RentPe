import axios from 'axios';
import { firebaseAuth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    if (config.headers.Authorization) {
      return config;
    }

    try {
      const firebaseUser = firebaseAuth.currentUser;
      if (firebaseUser) {
        config.headers.Authorization = `Bearer ${await firebaseUser.getIdToken()}`;
        return config;
      }
    } catch {
      // Fall back to a legacy session if Firebase token refresh is unavailable.
    }

    const legacyToken = localStorage.getItem('zingoo_token');
    if (legacyToken) {
      config.headers.Authorization = `Bearer ${legacyToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Handle unauthorized, clear token if expired
      // Don't auto-redirect immediately so UI can display message cleanly
    }
    const message =
      (error.response?.data?.details &&
        error.response.data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')) ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
