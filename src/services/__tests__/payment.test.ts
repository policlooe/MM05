import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../payment';
import api from '../api';

// Mock the api module
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            sessionId: 'sess_123',
            url: 'https://checkout.stripe.com/pay/sess_123',
            orderId: 'order_123',
            orderNumber: 'ORD-001',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await paymentService.createCheckoutSession();

      expect(api.post).toHaveBeenCalledWith('/checkout/create-session');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(paymentService.createCheckoutSession()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('redirectToCheckout', () => {
    it('should redirect to valid Stripe checkout URL', async () => {
      const validUrl = 'https://checkout.stripe.com/pay/sess_123';
      const assignMock = vi.fn();
      
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
      });

      await paymentService.redirectToCheckout(validUrl);

      expect(assignMock).toHaveBeenCalledWith(validUrl);
    });

    it('should reject invalid protocol', async () => {
      const invalidUrl = 'http://checkout.stripe.com/pay/sess_123';

      await expect(
        paymentService.redirectToCheckout(invalidUrl)
      ).rejects.toThrow('Invalid checkout redirect URL');
    });

    it('should reject invalid hostname', async () => {
      const invalidUrl = 'https://evil.com/pay/sess_123';

      await expect(
        paymentService.redirectToCheckout(invalidUrl)
      ).rejects.toThrow('Invalid checkout redirect URL');
    });

    it('should accept buy.stripe.com URLs', async () => {
      const validUrl = 'https://buy.stripe.com/test_123';
      const assignMock = vi.fn();
      
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
      });

      await paymentService.redirectToCheckout(validUrl);

      expect(assignMock).toHaveBeenCalledWith(validUrl);
    });
  });

  describe('checkoutAndRedirect', () => {
    it('should create session and redirect', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            sessionId: 'sess_123',
            url: 'https://checkout.stripe.com/pay/sess_123',
            orderId: 'order_123',
            orderNumber: 'ORD-001',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);
      
      const assignMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
      });

      await paymentService.checkoutAndRedirect();

      expect(api.post).toHaveBeenCalledWith('/checkout/create-session');
      expect(assignMock).toHaveBeenCalledWith(mockResponse.data.data.url);
    });
  });
});
