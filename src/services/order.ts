import api from './api';

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  customerNote?: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    finalPrice: number;
    configuration?: any;
    options?: any;
  }>;
  totalPrice: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: any;
    whatsappUrl: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
}

export const orderService = {
  /**
   * Создание заказа
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await api.post<CreateOrderResponse>('/orders', data);
    return response.data;
  },

  /**
   * Получение заказов пользователя
   */
  async getUserOrders(): Promise<{ success: boolean; data: Order[] }> {
    const response = await api.get<{ success: boolean; data: Order[] }>('/orders');
    return response.data;
  },

  /**
   * Получение заказа по ID
   */
  async getOrderById(id: string): Promise<{ success: boolean; data: Order }> {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Получение URL накладной
   */
  getInvoiceUrl(orderId: string): string {
    return `${import.meta.env.VITE_API_URL}/orders/${orderId}/invoice`;
  },

  /**
   * Открытие накладной в новой вкладке
   */
  openInvoice(orderId: string): void {
    window.open(this.getInvoiceUrl(orderId), '_blank');
  },
};
