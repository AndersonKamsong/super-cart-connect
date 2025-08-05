export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export type StaffRole = 'manager' | 'cashier' | 'inventory_manager' | 'delivery_personnel' | 'admin';

export interface StaffMember {
  _id?: string;
  user: any; // User ID
  role: StaffRole;
  permissions: string[];
  joinDate?: Date;
  active?: boolean;
  customTitle?: string;
}

export interface DeliveryPersonnel {
  _id?: string;
  user: string; // User ID
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | 'truck';
  licensePlate?: string;
  isAvailable?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface PaymentMethods {
  cash: boolean;
  card: boolean;
  mobileMoney: boolean;
  bankTransfer?: boolean;
}

export type ShopStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface ShopHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ShopSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  inventoryManagement: boolean;
  lowStockThreshold: number;
}

export interface Shop {
  _id: string;
  name: string;
  description: string;
  slug?: string;
  logo?: string;
  coverImage?: string;
  images?: string[];
  address: Address;
  contactInfo: ContactInfo;
  owner: string; // User ID
  staff?: StaffMember[];
  deliveryPersonnel?: DeliveryPersonnel[];
  status: ShopStatus;
  categories?: string[]; // Category IDs
  paymentMethods: PaymentMethods;
  businessHours?: ShopHours[];
  settings?: ShopSettings;
  createdAt?: Date;
  updatedAt?: Date;
  // Virtual fields
  products?: string[]; // Product IDs
  productCount?: number;
  orderCount?: number;
}

// DTOs
export interface CreateShopDto {
  name: string;
  description: string;
  logo?: string;
  address: Address;
  contactInfo: ContactInfo;
  paymentMethods?: PaymentMethods;
}

export interface UpdateShopDto {
  name?: string;
  description?: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  status?: ShopStatus;
  paymentMethods?: PaymentMethods;
}

export interface ShopSummary {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  status: ShopStatus;
  productCount?: number;
}

// types/shop.ts
export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ShopSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  inventoryManagement: boolean;
  lowStockThreshold: number;
}

export interface UpdateShopSettingsPayload {
  name?: string;
  description?: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  paymentMethods?: PaymentMethods;
  businessHours?: BusinessHours[];
  settings?: Partial<ShopSettings>;
}

export interface ShopStats {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  orderStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  monthlySales: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    stock: number;
    sold: number;
  }>;
  staffPerformance: Array<{
    staffId: string;
    name: string;
    email: string;
    orderCount: number;
    totalRevenue: number;
  }>;
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  sales: Array<{
    month: number;
    year: number;
    quantity: number;
  }>;
}