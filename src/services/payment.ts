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

export const paymentService = {
  /**
   * Create Stripe checkout session from cart
   */
  async createCheckoutSession(): Promise<CreateCheckoutSessionResponse> {
    const { data } = await api.post<CreateCheckoutSessionResponse>(
      '/checkout/create-session'
    );
    return data;
  },

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(url: string): Promise<void> {
    const checkoutUrl = new URL(url);
    const allowedHosts = new Set(['checkout.stripe.com', 'buy.stripe.com']);

    if (checkoutUrl.protocol !== 'https:' || !allowedHosts.has(checkoutUrl.hostname)) {
      throw new Error('Invalid checkout redirect URL');
    }

    window.location.assign(checkoutUrl.toString());
  },

  /**
   * Create checkout and redirect (convenience method)
   */
  async checkoutAndRedirect(): Promise<void> {
    const response = await this.createCheckoutSession();
    await this.redirectToCheckout(response.data.url);
  },
};
