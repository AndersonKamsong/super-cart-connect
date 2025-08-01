// Core application types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor' | 'customer' | 'delivery';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isVerified:boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  shopId: string;
  imageUrl: string;
  images?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  rating: number;
  isActive: boolean;
  deliveryPersonnel: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliveryPersonnelId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonnelId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  estimatedTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  minimumOrder?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
  data?:any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}