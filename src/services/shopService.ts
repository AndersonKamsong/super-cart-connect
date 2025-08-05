import { apiClient } from '@/lib/api';
import {
  Address,
  ContactInfo,
  CreateShopDto,
  DeliveryPersonnel,
  PaymentMethods,
  ProductAnalytics,
  Shop,
  ShopStats,
  ShopStatus,
  StaffMember,
  UpdateShopDto
} from '@/types/shop';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StaffOperationPayload {
  userId: string;
  role: StaffMember['role'];
  permissions: string[];
  customTitle?: string;
}

export interface DeliveryPersonnelPayload {
  userId: string;
  vehicleType?: DeliveryPersonnel['vehicleType'];
  licensePlate?: string;
}

export interface ShopImageUploadResponse {
  url: string;
  type: 'logo' | 'cover' | 'gallery';
}

interface ShopQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShopStatus;
  category?: string;
  featured?: boolean;
  sort?: string;
  near?: string; // "lat,lng,radius"
  owner?: string;
}

export const shopService = {
  // Basic Shop Operations
  createShop: async (data: CreateShopDto): Promise<Shop> => {
    return apiClient.post<Shop>('/shops', data);
  },

  getShop: async (id: string): Promise<Shop> => {
    return apiClient.get<Shop>(`/shops/${id}/detail`, {});
  },
  getShops: async (id: string): Promise<Shop> => {
    return apiClient.get<Shop>(`/shops`, {});
  },
  updateShop: async (id: string, data: UpdateShopDto): Promise<Shop> => {
    return apiClient.put<Shop>(`/shops/${id}`, data);
  },

  deleteShop: async (id: string): Promise<void> => {
    return apiClient.delete(`/shops/${id}`);
  },

  // Staff Management
  addStaff: async (shopId: string, data: StaffOperationPayload): Promise<Shop> => {
    return apiClient.post<Shop>(`/shops/${shopId}/staff`, data);
  },

  updateStaff: async (shopId: string, staffId: string, data: Partial<StaffOperationPayload>): Promise<Shop> => {
    return apiClient.patch<Shop>(`/shops/${shopId}/staff/${staffId}`, data);
  },

  removeStaff: async (shopId: string, staffId: string): Promise<Shop> => {
    return apiClient.delete<Shop>(`/shops/${shopId}/staff/${staffId}`);
  },

  getStaff: async (shopId: string): Promise<StaffMember[]> => {
    return apiClient.get<StaffMember[]>(`/shops/${shopId}/staff`, {});
  },

  // Delivery Personnel
  addDeliveryPersonnel: async (shopId: string, data: DeliveryPersonnelPayload): Promise<Shop> => {
    return apiClient.post<Shop>(`/shops/${shopId}/delivery`, data);
  },

  updateDeliveryPersonnel: async (shopId: string, personnelId: string, data: Partial<DeliveryPersonnelPayload>): Promise<Shop> => {
    return apiClient.patch<Shop>(`/shops/${shopId}/delivery/${personnelId}`, data);
  },

  removeDeliveryPersonnel: async (shopId: string, personnelId: string): Promise<Shop> => {
    return apiClient.delete<Shop>(`/shops/${shopId}/delivery/${personnelId}`);
  },

  getDeliveryPersonnel: async (shopId: string): Promise<DeliveryPersonnel[]> => {
    return apiClient.get<DeliveryPersonnel[]>(`/shops/${shopId}/delivery`, {});
  },

  // Media Management
  uploadImage: async (shopId: string, file: File, type: 'logo' | 'cover' | 'gallery'): Promise<ShopImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    return apiClient.post<ShopImageUploadResponse>(
      `/shops/${shopId}/media`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  deleteImage: async (shopId: string, imageUrl: string): Promise<void> => {
    return apiClient.delete(`/shops/${shopId}/media`, { data: { imageUrl } });
  },

  // Shop Listing
  listShops: async (params?: ShopQueryParams): Promise<PaginatedResponse<Shop>> => {
    return apiClient.get<PaginatedResponse<Shop>>('/shops', { params });
  },

  searchShops: async (query: string, filters?: Omit<ShopQueryParams, 'search'>): Promise<Shop[]> => {
    return apiClient.get<Shop[]>('/shops/search', { params: { search: query, ...filters } });
  },

  // Vendor-specific
  getVendorShops: async (vendorId?: string): Promise<Shop[]> => {
    return apiClient.get<Shop[]>(`/shops/vendor${vendorId ? `/${vendorId}` : ''}`, {});
  },

  // Analytics
  getShopAnalytics: async (shopId: string): Promise<{
    products: number;
    orders: number;
    revenue: number;
    topProducts: Array<{
      productId: string;
      name: string;
      sales: number;
    }>;
  }> => {
    return apiClient.get(`/shops/${shopId}/analytics`, {});
  },

  getShopStats: async (shopId: string): Promise<ShopStats> => {
    return apiClient.get<ShopStats>(`/shops/${shopId}/stats`, {});
  },

  getProductAnalytics: async (shopId: string): Promise<ProductAnalytics[]> => {
    return apiClient.get<ProductAnalytics[]>(`/shops/${shopId}/analytics/products`, {});
  },

  // Helper to format monthly data for charts
  formatMonthlyData: (data: { month: string; value: number }[]) => {
    return {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Sales',
          data: data.map(item => item.value),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  },

  // Helper to format product stock vs sold data
  formatProductInventoryData: (products: {
    name: string;
    stock: number;
    sold: number;
  }[]) => {
    return {
      labels: products.map(p => p.name),
      datasets: [
        {
          label: 'Current Stock',
          data: products.map(p => p.stock),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Sold (Last 3 months)',
          data: products.map(p => p.sold),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  },
};