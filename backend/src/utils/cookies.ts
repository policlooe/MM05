/**
 * Единая политика cookie для авторизации и CSRF.
 *
 * Схема деплоя: фронт на Vercel (`*.vercel.app`), API на Railway
 * (`*.up.railway.app`). Это РАЗНЫЕ сайты (разные registrable domains), поэтому
 * `SameSite=strict`/`lax` браузер не отправит на cross-site POST — логин,
 * refresh и оформление заказа падают с 401/403.
 *
 * COOKIE_SAME_SITE:
 *   - `none`   — дефолт для production: работает на разных доменах, требует Secure
 *                (в Safari/Chrome третьи стороны могут блокироваться — см. DEPLOY.md,
 *                рекомендуется свой домен: `mm05.ru` + `api.mm05.ru` → `lax`);
 *   - `lax`    — когда фронт и API на одном registrable domain (поддомены);
 *   - `strict` — максимальная защита, только тот же сайт.
 */
export type CookieSameSite = 'lax' | 'strict' | 'none';

function resolveSameSite(): CookieSameSite {
  const raw = (process.env.COOKIE_SAME_SITE || '').trim().toLowerCase();

  if (raw === 'none' || raw === 'lax' || raw === 'strict') {
    return raw;
  }

  // Без явной настройки: в проде фронт и API почти наверняка на разных доменах,
  // иначе авторизация молча ломается; локальная разработка (http) — `lax`.
  return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
}

export const COOKIE_SAME_SITE: CookieSameSite = resolveSameSite();

/**
 * SameSite=None браузеры принимают только с Secure, поэтому в этом режиме
 * флаг включается принудительно.
 */
export const COOKIE_SECURE =
  process.env.NODE_ENV === 'production' || COOKIE_SAME_SITE === 'none';

export const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAME_SITE,
  path: '/',
} as const;
