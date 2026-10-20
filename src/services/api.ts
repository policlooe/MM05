import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно для отправки cookies
});

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;
let refreshPromise: Promise<void> | null = null;

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  csrfTokenPromise ??= axios
    .get(`${API_URL}/csrf-token`, { withCredentials: true })
    .then((response) => {
      csrfToken = response.data.csrfToken;
      return csrfToken as string;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  if (method && CSRF_METHODS.has(method)) {
    config.headers.set('X-CSRF-Token', await getCsrfToken());
  }

  return config;
});

/**
 * Обновление сессии: один запрос на все параллельные 401 (single-flight).
 * Раньше каждый 401 отправлял свой /auth/refresh; из-за ротации токенов
 * второй запрос падал и пользователя выкидывало из аккаунта посреди работы.
 * CSRF-заголовок обязателен: сервер защищает все не-GET /api-роуты.
 */
async function refreshSession(): Promise<void> {
  refreshPromise ??= (async () => {
    const token = await getCsrfToken();
    await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'X-CSRF-Token': token },
      }
    );
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));

    // 401 на /auth/login — это неверный пароль: форму нельзя перезагружать,
    // иначе сообщение об ошибке никогда не показывается.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403 && originalRequest && !originalRequest._csrfRetry) {
      csrfToken = null;
      originalRequest._csrfRetry = true;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
