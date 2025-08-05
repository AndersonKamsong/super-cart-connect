// services/order.service.ts
import { apiClient } from '@/lib/api';
import {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryParams
} from '@/types/order';

export const orderService = {
  // Create a new order
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    return apiClient.post<Order>('/orders', data);
  },

  // Get all orders (admin only)
  getOrders: async (params?: OrderQueryParams): Promise<Order[]> => {
    return apiClient.get<Order[]>('/orders', { params });
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`, {});
  },

  // Update order status
  updateOrderStatus: async (id: string, shopId: string, data: UpdateOrderStatusDto): Promise<Order> => {
    return apiClient.put<Order>(`/orders/${id}/status/${shopId}`, data);
  },

  // Get orders for a shop
  getShopOrders: async (shopId: string, params?: OrderQueryParams): Promise<Order[]> => {
    return apiClient.get<Order[]>(`/orders/shop/${shopId}`, { params });
  },

  // Get orders for a customer
  getCustomerOrders: async (customerId: string, params?: OrderQueryParams): Promise<Order[]> => {
    return apiClient.get<Order[]>(`/orders/customer/${customerId}`, { params });
  },

  // Calculate order totals (client-side)
  // calculateTotals: (items: CreateOrderDto['items'], tax = 0, deliveryFee = 0, discount = 0) => {
  //   const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  //   const total = subtotal + tax + deliveryFee - discount;

  //   return {
  //     subtotal,
  //     tax,
  //     deliveryFee,
  //     discount,
  //     total
  //   };
  // }
};