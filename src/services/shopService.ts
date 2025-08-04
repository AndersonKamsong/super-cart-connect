// src/services/shop.service.ts
import { apiClient } from '@/lib/api';
import { Address, ContactInfo, PaymentMethods, Shop } from '@/types/shop';

export interface ShopCreatePayload {
  name: string;
  description: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  paymentMethods?: PaymentMethods;
}

export interface ShopUpdatePayload {
  name?: string;
  description?: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  paymentMethods?: PaymentMethods;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface StaffOperationPayload {
  userId: string;
  role?: 'manager' | 'cashier' | 'inventory_manager' | 'other';
  permissions?: string[];
}

export interface ShopStatusUpdatePayload {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface ShopImageUploadResponse {
  url: string;
  type: 'logo' | 'cover' | 'gallery';
}

// Query params
interface ShopQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  category?: string;
  featured?: boolean;
  sort?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface ShopResponse {
  shops: Shop[];
  total: number;
  data: Shop[] | Shop;
}

export const shopService = {
  // Public endpoints
  getShops: async (params?: ShopQueryParams): Promise<ShopResponse> => {
    return apiClient.get<ShopResponse>('/shops', { params });
  },

  getShopById: async (id: string): Promise<Shop> => {
    return apiClient.get<Shop>(`/shops/${id}`);
  },

  getNearbyShops: async (lat: number, lng: number, radius: number = 5000): Promise<Shop[]> => {
    return apiClient.get<Shop[]>('/shops/nearby', { params: { lat, lng, radius } });
  },

  searchShops: async (query: string, filters?: Omit<ShopQueryParams, 'page' | 'limit'>): Promise<Shop[]> => {
    return apiClient.get<Shop[]>('/shops/search', { params: { q: query, ...filters } });
  },

  // Protected endpoints
  createShop: async (data: ShopCreatePayload): Promise<ShopResponse> => {
    return apiClient.post<ShopResponse>('/shops', data);
  },

  updateShop: async (id: string, data: ShopUpdatePayload): Promise<ShopResponse> => {
    return apiClient.put<ShopResponse>(`/shops/${id}`, data);
  },

  deleteShop: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/shops/${id}`);
  },

  // Staff management
  addStaff: async (shopId: string, data: StaffOperationPayload): Promise<Shop> => {
    return apiClient.post<Shop>(`/shops/${shopId}/staff`, data);
  },

  removeStaff: async (shopId: string, userId: string): Promise<Shop> => {
    return apiClient.delete<Shop>(`/shops/${shopId}/staff/${userId}`);
  },

  // Vendor-specific
  getVendorShops: async (): Promise<ShopResponse[]> => {
    return apiClient.get<ShopResponse[]>(`/shops/vendor`);
  },

  // Image upload
  uploadShopImage: async (
    shopId: string,
    file: File,
    type: 'logo' | 'cover' | 'gallery'
  ): Promise<ShopImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    return apiClient.post<ShopImageUploadResponse>(
      `/shops/${shopId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Admin functions
  updateShopStatus: async (
    shopId: string,
    data: ShopStatusUpdatePayload
  ): Promise<Shop> => {
    return apiClient.patch<Shop>(`/shops/${shopId}/status`, data);
  },

  // Metrics and analytics
  getShopMetrics: async (shopId: string): Promise<{
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    popularProducts: Array<{
      productId: string;
      name: string;
      salesCount: number;
    }>;
  }> => {
    return apiClient.get(`/shops/${shopId}/metrics`);
  },
};