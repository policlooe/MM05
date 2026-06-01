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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

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
