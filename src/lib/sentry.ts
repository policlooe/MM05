import * as Sentry from "@sentry/react";

/**
 * Инициализация Sentry для мониторинга ошибок
 * Документация: https://docs.sentry.io/platforms/javascript/guides/react/
 */
export function initSentry() {
  // Проверяем, что мы в production и есть DSN
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  if (!dsn) {
    console.warn('Sentry DSN не настроен. Мониторинг ошибок отключен.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Интеграции
    integrations: [
      // Автоматический трейсинг React компонентов
      Sentry.browserTracingIntegration(),
      
      // Replay сессий для отладки
      Sentry.replayIntegration({
        maskAllText: true, // Маскируем текст для приватности
        blockAllMedia: true, // Блокируем медиа
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% в production
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% сессий
    replaysOnErrorSampleRate: 1.0, // 100% сессий с ошибками

    // Фильтрация ошибок
    beforeSend(event, hint) {
      // Игнорируем ошибки от расширений браузера
      if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
        return null;
      }
      
      // Игнорируем ошибки сети (они не критичны)
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      return event;
    },

    // Дополнительный контекст
    initialScope: {
      tags: {
        app: 'mm05-frontend',
      },
    },
  });
}

/**
 * Установка пользователя в Sentry
 */
export function setSentryUser(user: { id: string; email: string; role: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Очистка пользователя при logout
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Ручная отправка ошибки в Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Отправка кастомного события
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
