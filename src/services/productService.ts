// src/services/product.service.ts
import { apiClient } from '@/lib/api';
import { Product, ProductImage, ProductVariant, ProductOption, ProductQueryParams } from '@/types/products';

export interface ProductCreatePayload {
  name: string;
  description?: string;
  shop: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  images?: ProductImage[];
  category: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  removedVariantIds?: string[];
}

export interface InventoryUpdatePayload {
  stock: number;
  variantId?: string;
}

export interface ProductImageUploadResponse {
  url: string;
  alt?: string;
}

export interface VariantOperationPayload {
  options: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  data: Product[] | Product;
}

export const productService = {
  // Public endpoints
  getProducts: async (params?: ProductQueryParams): Promise<ProductResponse> => {
    return apiClient.get<ProductResponse>('/products', { params });
  },
  getProductByShop: async (shopId: string, params?: ProductQueryParams): Promise<ProductResponse> => {
    return apiClient.get<ProductResponse>(`/products/shops-page/${shopId}`, { params });
  },
  getProductById: async (id: string): Promise<Product> => {
    return apiClient.get<Product>(`/products/${id}`, {});
  },

  getFeaturedProducts: async (limit: number = 10): Promise<Product[]> => {
    return apiClient.get<Product[]>('/products/featured', { params: { limit } });
  },

  getBestsellerProducts: async (limit: number = 10): Promise<Product[]> => {
    return apiClient.get<Product[]>('/products/bestsellers', { params: { limit } });
  },

  searchProducts: async (
    query: string,
    filters?: Omit<ProductQueryParams, 'page' | 'limit'>
  ): Promise<Product[]> => {
    return apiClient.get<Product[]>('/products/search', { params: { q: query, ...filters } });
  },

  getRelatedProducts: async (categoryId: string, limit: number = 4): Promise<Product[]> => {
    return apiClient.get<Product[]>(`/products/categories/${categoryId}`, { params: { limit } });
  },

  // Protected endpoints (vendor/admin)
  createProduct: async (data): Promise<Product> => {
    return apiClient.post<Product>('/products', data);
  },

  updateProduct: async (id: string, data): Promise<Product> => {
    return apiClient.put<Product>(`/products/${id}`, data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${id}`);
  },

  // Inventory management
  updateInventory: async (
    productId: string,
    data: InventoryUpdatePayload
  ): Promise<Product> => {
    return apiClient.patch<Product>(`/products/${productId}/inventory`, data);
  },

  // Variant management
  addVariant: async (
    productId: string,
    data: VariantOperationPayload
  ): Promise<Product> => {
    return apiClient.post<Product>(`/products/${productId}/variants`, data);
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    data: VariantOperationPayload
  ): Promise<Product> => {
    return apiClient.put<Product>(`/products/${productId}/variants/${variantId}`, data);
  },

  removeVariant: async (productId: string, variantId: string): Promise<Product> => {
    return apiClient.delete<Product>(`/products/${productId}/variants/${variantId}`);
  },

  // Image management
  uploadProductImage: async (
    productId: string,
    file: File,
    alt?: string
  ): Promise<ProductImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (alt) formData.append('alt', alt);

    return apiClient.post<ProductImageUploadResponse>(
      `/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  deleteProductImage: async (productId: string, imageUrl: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${productId}/images`, {
      data: { imageUrl },
    });
  },

  // Vendor-specific
  getShopProducts: async (shopId: string, params?: Omit<ProductQueryParams, 'shop'>): Promise<ProductResponse> => {
    return apiClient.get<ProductResponse>(`/products/shops/${shopId}`, { params });
  },

  // Status management
  toggleProductStatus: async (productId: string): Promise<Product> => {
    return apiClient.patch<Product>(`/products/${productId}/status`);
  },

  // Metrics and analytics
  getProductMetrics: async (productId: string): Promise<{
    views: number;
    sales: number;
    conversionRate: number;
    averageRating?: number;
  }> => {
    return apiClient.get(`/products/${productId}/metrics`, {});
  },

  // Admin functions
  bulkUpdateProducts: async (ids: string[], data: Partial<ProductUpdatePayload>): Promise<{ count: number }> => {
    return apiClient.patch('/products/bulk', { ids, data });
  },
};