import { apiClient } from '@/lib/api';
import {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategoryQueryParams,
  CategoryResponse
} from '@/types/category';

export const categoryService = {
  // Public endpoints
  getCategories: async (params?: CategoryQueryParams): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>('/categories', { params });
  },

  getCategoryById: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  searchCategories: async (query: string): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/search', { params: { q: query } });
  },

  // Protected admin endpoints
  createCategory: async (data: CategoryCreatePayload): Promise<Category> => {
    return apiClient.post<Category>('/categories', data);
  },

  updateCategory: async (id: string, data: CategoryUpdatePayload): Promise<Category> => {
    return apiClient.put<Category>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/categories/${id}`);
  },

  toggleCategoryStatus: async (id: string): Promise<Category> => {
    return apiClient.patch<Category>(`/categories/${id}/status`);
  },

  // Utility functions
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
};