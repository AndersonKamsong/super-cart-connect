export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export interface StaffMember {
  user: string; // User ID
  role?: 'manager' | 'cashier' | 'inventory_manager' | 'other';
  permissions?: string[];
}

export interface DeliveryPersonnel {
  user: string; // User ID
  vehicleType?: string;
  isAvailable?: boolean;
}

export interface PaymentMethods {
  cash?: boolean;
  card?: boolean;
  mobileMoney?: boolean;
}

export interface Shop {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  owner: string; // User ID
  staff?: StaffMember[];
  deliveryPersonnel?: DeliveryPersonnel[];
  status?: 'active' | 'inactive' | 'suspended';
  categories?: string[]; // Category IDs
  paymentMethods?: PaymentMethods;
  createdAt?: Date;
  updatedAt?: Date;
  // Virtual fields
  products?: string[]; // Product IDs - this would be populated if you're using the virtual
}

// For creating a new shop (might omit some required fields that are set server-side)
export interface CreateShopDto {
  name: string;
  description: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  // owner is typically set server-side based on authenticated user
  paymentMethods?: PaymentMethods;
}

// For updating a shop
export interface UpdateShopDto {
  name?: string;
  description?: string;
  logo?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  status?: 'active' | 'inactive' | 'suspended';
  paymentMethods?: PaymentMethods;
}

// For shop listings (might include fewer fields)
export interface ShopSummary {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  status?: string;
}