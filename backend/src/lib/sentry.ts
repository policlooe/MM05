import * as Sentry from '@sentry/node';

/**
 * Инициализация Sentry для мониторинга ошибок в backend
 * Документация: https://docs.sentry.io/platforms/node/
 */
export async function initSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('⚠️  Sentry DSN не настроен. Мониторинг ошибок отключен.');
    return;
  }

  // Профайлер — нативный модуль: если бинарник не установлен/не загрузился,
  // бэкенд всё равно должен стартовать (мониторинг важнее профилирования)
  let profilingIntegration: ReturnType<typeof import('@sentry/profiling-node').nodeProfilingIntegration> | undefined;
  try {
    profilingIntegration = (await import('@sentry/profiling-node')).nodeProfilingIntegration();
  } catch {
    console.warn('⚠️  Sentry profiling недоступен (нативный модуль не загружается) — пропущено.');
  }

  Sentry.init({
    dsn,
    environment,

    // Интеграции
    integrations: [
      // HTTP трейсинг
      Sentry.httpIntegration(),

      // Profiling (опционально)
      ...(profilingIntegration ? [profilingIntegration] : []),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Фильтрация ошибок
    beforeSend(event, hint) {
      // Игнорируем 404 ошибки
      if (event.exception?.values?.[0]?.value?.includes('404')) {
        return null;
      }

      return event;
    },

    // Дополнительный контекст
    initialScope: {
      tags: {
        app: 'mm05-backend',
      },
    },
  });

  console.log('✅ Sentry инициализирован для мониторинга ошибок');
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
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}
