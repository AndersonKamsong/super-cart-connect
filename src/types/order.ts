// types/order.ts
export interface OrderItem {
  product: any; // Product ID
  shop: string; // Shop ID
  quantity: number;
  price: number;
  totalPrice: number;
  name?: string; // Populated field
  image?: string; // Populated field
  variantId?: string; // Added variant support
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_money';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryType = 'delivery' | 'pickup';

export interface ShopOrder {
  shop: any; // Shop ID
  items: OrderItem[];
  customer?: any; // User ID
  _id?: string;
  orderNumber?: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress?: ShippingAddress; // Optional for pickup orders
  deliveryType: DeliveryType;
  // Populated fields
  shopName?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

export interface Order {
  orderId: string;
  _id: string;
  orderNumber: string;
  customer: any; // User ID
  shopOrders: ShopOrder[]; // Array of shop-specific orders
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  grandTotal: number; // Sum of all shopOrder totals
  shippingAddress?: ShippingAddress; // Optional for pickup orders
  // Populated fields
  customerName?: string;
}

export interface CreateShopOrderDto {
  shop: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    variantId?: string;
  }>;
  shippingAddress?: ShippingAddress;
  deliveryType: DeliveryType;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
}

export interface CreateOrderDto {
  customer: string;
  shopOrders: CreateShopOrderDto[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  shopId: string;
  status: OrderStatus;
  reason?: string; // Optional cancellation reason
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customer?: string;
  shop?: string; // Filter by specific shop
  sort?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
  shopBreakdown?: Array<{
    shopId: string;
    shopName: string;
    orderCount: number;
    totalRevenue: number;
  }>;
}