import apiClient from '@/lib/api';
import type { ShippingAddress, CartItem } from '@/lib/types';

export interface CreateOrderPayload {
  addressId?: string;
  shippingAddress?: ShippingAddress;
  paymentMethod: string;
  deliverySpeed: string;
  couponCode?: string;
  valuMonths?: number;
  items?: CartItem[];
}

export interface BackendOrderResponse {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDate: string;
  trackingNumber: string;
  valuMonths?: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    governorate: string;
    cityArea: string;
    streetAddress: string;
    buildingFloor: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    brand: string;
    productImage: string;
    variantLabel?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
}

export const orderService = {
  /**
   * Submit new order to backend API
   */
  async createOrder(payload: CreateOrderPayload): Promise<BackendOrderResponse> {
    const formattedPaymentMethod = payload.paymentMethod === 'cod' ? 'Cod' : payload.paymentMethod === 'valu' ? 'Valu' : 'Card';

    const body = {
      addressId: payload.addressId || undefined,
      shippingAddress: payload.shippingAddress
        ? {
            fullName: payload.shippingAddress.fullName,
            phone: payload.shippingAddress.phone,
            governorate: payload.shippingAddress.governorate,
            cityArea: payload.shippingAddress.cityArea,
            streetAddress: payload.shippingAddress.streetAddress,
            buildingFloor: payload.shippingAddress.buildingFloor,
          }
        : undefined,
      paymentMethod: formattedPaymentMethod,
      deliverySpeed: payload.deliverySpeed || 'express',
      couponCode: payload.couponCode || undefined,
      valuMonths: payload.valuMonths || undefined,
      items: payload.items?.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        name: item.name,
        brand: item.brand,
        image: item.image,
        variantLabel: item.variantLabel,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    const response = await apiClient.post<BackendOrderResponse>('/orders', body);
    return response.data;
  },

  /**
   * Fetch order receipt by ID
   */
  async getOrderById(orderId: string): Promise<BackendOrderResponse | null> {
    try {
      const response = await apiClient.get<BackendOrderResponse>(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      console.warn(`[orderService.getOrderById] Order ${orderId} could not be retrieved from API:`, err);
      return null;
    }
  },
};

export default orderService;
