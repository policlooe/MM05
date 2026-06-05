import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackAddToCart,
  trackPurchase,
  setAnalyticsConsent,
} from '../analytics';

describe('Analytics', () => {
  beforeEach(() => {
    // Reset window.gtag and dataLayer
    delete window.gtag;
    delete window.dataLayer;
    
    // Clear document head scripts
    document.head.innerHTML = '';
    localStorage.clear();
    
    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('initGoogleAnalytics', () => {
    it('should warn if measurement ID is not configured', () => {
      import.meta.env.VITE_GA_MEASUREMENT_ID = '';
      
      initGoogleAnalytics();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Google Analytics Measurement ID не настроен'
      );
    });

    it('should warn if measurement ID has invalid format', () => {
      import.meta.env.VITE_GA_MEASUREMENT_ID = 'INVALID-ID';
      
      initGoogleAnalytics();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Google Analytics Measurement ID имеет неверный формат'
      );
    });

    it('should initialize GA with valid measurement ID', () => {
      import.meta.env.VITE_GA_MEASUREMENT_ID = 'G-ABCD1234';
      
      initGoogleAnalytics();
      
      // Check script was added
      const scripts = document.head.querySelectorAll('script');
      const gaScript = Array.from(scripts).find(s => 
        s.src.includes('googletagmanager.com/gtag/js')
      );
      
      expect(gaScript).toBeDefined();
      expect(window.gtag).toBeDefined();
      expect(window.dataLayer).toBeDefined();
    });
  });

  describe('trackPageView', () => {
    it('should not track if gtag is not initialized', () => {
      trackPageView('/test-page');
      // Should not throw error
      expect(window.gtag).toBeUndefined();
    });

    it('should track page view with gtag', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;
      setAnalyticsConsent(true);
      mockGtag.mockClear();
      
      trackPageView('/test-page', 'Test Page');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test-page',
        page_title: 'Test Page',
      });
    });
  });

  describe('trackAddToCart', () => {
    it('should track add to cart event', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;
      setAnalyticsConsent(true);
      mockGtag.mockClear();
      
      const product = {
        id: 'prod-123',
        name: 'Test Product',
        price: 10000,
        category: 'Кровати',
      };
      
      trackAddToCart(product);
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        currency: 'RUB',
        value: 10000,
        items: [
          {
            item_id: 'prod-123',
            item_name: 'Test Product',
            item_category: 'Кровати',
            price: 10000,
            quantity: 1,
          },
        ],
      });
    });
  });

  describe('trackPurchase', () => {
    it('should track purchase event', () => {
      const mockGtag = vi.fn();
      window.gtag = mockGtag;
      
      const items = [
        { item_id: 'prod-1', item_name: 'Product 1', price: 5000 },
      ];
      
      trackPurchase('order-123', 5000, items);
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        transaction_id: 'order-123',
        currency: 'RUB',
        value: 5000,
        items,
      });
    });
  });
});
