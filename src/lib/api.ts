import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type if it's FormData (let axios handle it automatically)
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/password', { oldPassword, newPassword }),
};

// Articles API
export const articlesApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    api.get('/articles', { params }),
  getBySlug: (slug: string) => api.get(`/articles/${slug}`),
  getAdminList: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/articles/admin/list', { params }),
  getAdminDetail: (id: number) => api.get(`/articles/admin/${id}`),
  create: (data: {
    title: string;
    content: string;
    category_id?: number;
    cover_image?: string;
    status: 'draft' | 'published';
  }) => api.post('/articles', data),
  update: (id: number, data: Partial<{
    title: string;
    content: string;
    category_id: number;
    cover_image: string;
    status: 'draft' | 'published';
  }>) => api.put(`/articles/${id}`, data),
  delete: (id: number) => api.delete(`/articles/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: { name: string; slug: string; description?: string; sort_order?: number }) =>
    api.post('/categories', data),
  update: (id: number, data: Partial<{ name: string; slug: string; description: string; sort_order: number }>) =>
    api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData);
  },
};

// Settings API
export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  update: (data: Record<string, any>) => api.put('/settings', data),
  updateByKey: (key: string, value: any) => api.put(`/settings/${key}`, { value }),
};
