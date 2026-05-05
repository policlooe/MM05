/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to Google Analytics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Send metric to Google Analytics
 */
function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Track custom events
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${category} - ${action}`, { label, value });
  }
}

/**
 * Track page views
 */
export function trackPageView(path: string, title?: string) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track e-commerce events
 */
export const ecommerce = {
  /**
   * Track product view
   */
  viewItem: (product: { id: string; name: string; price: number; category: string }) => {
    trackEvent('Ecommerce', 'view_item', product.name, product.price);
    
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'RUB',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        }],
      });
    }
  },

  /**
   * Track add to cart
   */
  addToCart: (product: { id: string; name: string; price: number; quantity: number }) => {
    trackEvent('Ecommerce', 'add_to_cart', product.name, product.price * product.quantity);
    
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'RUB',
        value: product.price * product.quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
        }],
      });
    }
  },

  /**
   * Track begin checkout
   */
  beginCheckout: (items: Array<{ id: string; name: string; price: number; quantity: number }>, total: number) => {
    trackEvent('Ecommerce', 'begin_checkout', `${items.length} items`, total);
    
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'RUB',
        value: total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  },

  /**
   * Track purchase
   */
  purchase: (
    orderId: string,
    items: Array<{ id: string; name: string; price: number; quantity: number }>,
    total: number
  ) => {
    trackEvent('Ecommerce', 'purchase', orderId, total);
    
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'RUB',
        value: total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  },
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
