import { loadStripe } from '@stripe/stripe-js';
import api from './api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface CreateCheckoutSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
    orderId: string;
    orderNumber: string;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
}

// Simple rate limiting: track last checkout attempt
let lastCheckoutAttempt = 0;
const CHECKOUT_COOLDOWN_MS = 3000; // 3 seconds between attempts

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'NETWORK' | 'INVALID_URL' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const paymentService = {
  /**
   * Create Stripe checkout session from cart
   * @throws {PaymentError} If rate limited or network error occurs
   */
  async createCheckoutSession(): Promise<CreateCheckoutSessionResponse> {
    // Rate limiting check
    const now = Date.now();
    if (now - lastCheckoutAttempt < CHECKOUT_COOLDOWN_MS) {
      throw new PaymentError(
        'Пожалуйста, подождите несколько секунд перед повторной попыткой',
        'RATE_LIMIT'
      );
    }
    
    lastCheckoutAttempt = now;

    try {
      const { data } = await api.post<CreateCheckoutSessionResponse>(
        '/checkout/create-session'
      );
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new PaymentError(
          `Ошибка создания сессии оплаты: ${error.message}`,
          'NETWORK'
        );
      }
      throw new PaymentError('Неизвестная ошибка при создании сессии оплаты', 'UNKNOWN');
    }
  },

  /**
   * Redirect to Stripe Checkout
   * @throws {PaymentError} If URL is invalid or insecure
   */
  async redirectToCheckout(url: string): Promise<void> {
    try {
      const checkoutUrl = new URL(url);
      const allowedHosts = new Set(['checkout.stripe.com', 'buy.stripe.com']);

      if (checkoutUrl.protocol !== 'https:' || !allowedHosts.has(checkoutUrl.hostname)) {
        throw new PaymentError(
          'Недопустимый URL для перенаправления на оплату',
          'INVALID_URL'
        );
      }

      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError('Ошибка при перенаправлении на страницу оплаты', 'INVALID_URL');
    }
  },

  /**
   * Create checkout and redirect (convenience method)
   * @throws {PaymentError} If any step fails
   */
  async checkoutAndRedirect(): Promise<void> {
    try {
      const response = await this.createCheckoutSession();
      await this.redirectToCheckout(response.data.url);
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentError('Ошибка при оформлении заказа', 'UNKNOWN');
    }
  },
};
