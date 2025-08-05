// types/order.ts
export interface OrderItem {
  product: string; // Product ID
  quantity: number;
  price: number;
  totalPrice: number;
  name?: string; // Populated field
  image?: string; // Populated field
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

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string; // User ID
  shop: string; // Shop ID
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  deliveryType: DeliveryType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  customerName?: string;
  shopName?: string;
}

export interface CreateOrderDto {
  shop: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes?: string;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customer?: string;
  shop?: string;
  sort?: string;
}