/**
 * Google Analytics 4 интеграция
 * Документация: https://developers.google.com/analytics/devguides/collection/ga4
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[][];
  }
}

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

// Consent state management
let analyticsConsent = false;

/**
 * Set analytics consent (for GDPR compliance)
 */
export function setAnalyticsConsent(granted: boolean) {
  analyticsConsent = granted;
  
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
  
  // Store consent in localStorage
  try {
    localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied');
  } catch (e) {
    console.warn('Failed to store analytics consent:', e);
  }
}

/**
 * Get analytics consent status
 */
export function getAnalyticsConsent(): boolean {
  try {
    const stored = localStorage.getItem('analytics_consent');
    return stored === 'granted';
  } catch (e) {
    return false;
  }
}

/**
 * Инициализация Google Analytics
 */
export function initGoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics Measurement ID не настроен');
    return;
  }

  if (!GA_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    console.warn('Google Analytics Measurement ID имеет неверный формат');
    return;
  }

  // Check stored consent
  analyticsConsent = getAnalyticsConsent();

  // Загружаем скрипт Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.onerror = () => {
    console.error('Failed to load Google Analytics script');
  };
  document.head.appendChild(script);

  // Инициализируем dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  // Set default consent
  window.gtag('consent', 'default', {
    analytics_storage: analyticsConsent ? 'granted' : 'denied',
  });

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    anonymize_ip: true, // Анонимизация IP для GDPR
  });

  console.log('✅ Google Analytics инициализирован');
}

/**
 * Отслеживание просмотра страницы
 */
export function trackPageView(path: string, title?: string) {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Отслеживание события
 */
export function trackEvent(
  eventName: string,
  params?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
  }
) {
  if (!window.gtag || !analyticsConsent) return;

  try {
    window.gtag('event', eventName, params);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Отслеживание добавления в корзину
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  trackEvent('add_to_cart', {
    currency: 'RUB',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1,
      },
    ],
  });
}

/**
 * Отслеживание начала оформления заказа
 */
export function trackBeginCheckout(items: unknown[], total: number) {
  trackEvent('begin_checkout', {
    currency: 'RUB',
    value: total,
    items,
  });
}

/**
 * Отслеживание покупки
 */
export function trackPurchase(orderId: string, total: number, items: unknown[]) {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'RUB',
    value: total,
    items,
  });
}

/**
 * Отслеживание поиска
 */
export function trackSearch(searchTerm: string) {
  trackEvent('search', {
    search_term: searchTerm,
  });
}

/**
 * Отслеживание просмотра товара
 */
export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  trackEvent('view_item', {
    currency: 'RUB',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

/**
 * Отслеживание регистрации
 */
export function trackSignUp(method: string = 'email') {
  trackEvent('sign_up', {
    method,
  });
}

/**
 * Отслеживание входа
 */
export function trackLogin(method: string = 'email') {
  trackEvent('login', {
    method,
  });
}
