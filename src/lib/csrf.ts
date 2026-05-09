import api from '../services/api';

let csrfToken: string | null = null;

/**
 * Получает CSRF токен с сервера
 * Кэширует токен для повторного использования
 */
export const getCsrfToken = async (): Promise<string> => {
  if (!csrfToken) {
    try {
      const response = await api.get('/csrf-token');
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      throw error;
    }
  }
  return csrfToken;
};

/**
 * Сбрасывает кэшированный CSRF токен
 * Используется при ошибках CSRF для получения нового токена
 */
export const resetCsrfToken = (): void => {
  csrfToken = null;
};

/**
 * Инициализирует CSRF защиту
 * Добавляет interceptor к axios для автоматической отправки CSRF токена
 */
export const initCsrfProtection = (): void => {
  // Добавляем interceptor для автоматической отправки CSRF токена
  api.interceptors.request.use(
    async (config) => {
      // Добавляем CSRF токен только для state-changing методов
      const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
      
      if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
        try {
          const token = await getCsrfToken();
          config.headers['X-CSRF-Token'] = token;
        } catch (error) {
          console.error('Failed to add CSRF token to request:', error);
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Добавляем interceptor для обработки ошибок CSRF
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Если получили ошибку CSRF (403 Forbidden с сообщением о CSRF)
      if (
        error.response?.status === 403 &&
        error.response?.data?.error?.toLowerCase().includes('csrf')
      ) {
        // Сбрасываем токен и пытаемся повторить запрос
        resetCsrfToken();
        
        const originalRequest = error.config;
        if (!originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;
          
          try {
            const token = await getCsrfToken();
            originalRequest.headers['X-CSRF-Token'] = token;
            return api(originalRequest);
          } catch (retryError) {
            return Promise.reject(retryError);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
};
