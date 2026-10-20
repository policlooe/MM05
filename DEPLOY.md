# Деплой MM05: Vercel (фронт) + Railway (API и PostgreSQL)

Схема: **фронт** на Vercel (`*.vercel.app`), **API** на Railway
(`*.up.railway.app`), **PostgreSQL** — сервис Postgres в том же проекте Railway
(подходит и Supabase: важно только значение `DATABASE_URL`).

---

## 0. Критично: фронт и API на разных сайтах

`vercel.app` и `railway.app` — разные registrable domains, то есть для браузера
это **разные сайты**. Из этого следуют три обязательных настройки, иначе логин
и оформление заказа падают с 401/403:

1. **Cookie** (`COOKIE_SAME_SITE`). По умолчанию в production бэкенд ставит
   `SameSite=None; Secure`, иначе браузер не отправит auth/CSRF cookie на
   cross-site POST. Значение `strict`/`lax` допустимо только когда фронт и API
   на одном домене.
2. **CORS**. `FRONTEND_URL` должен точно совпадать с origin Vercel **без**
   слэша в конце (`https://mm05.vercel.app`). Для превью-деплоев есть
   `ALLOW_VERCEL_PREVIEWS=true`, но он открывает API любому `*.vercel.app`.
3. **`VITE_API_URL`** на Vercel — абсолютный URL Railway с суффиксом `/api`.

> **Рекомендация для продакшена:** свой домен (`mm05.ru` на Vercel +
> `api.mm05.ru` на Railway). Поддомены одного домена — это *same-site*, тогда
> `COOKIE_SAME_SITE=lax` и третьи стороны не блокируются (Safari/ITP и
> Chrome с блокировкой third-party cookies иначе могут резать авторизацию).

---

## 1. PostgreSQL

Вариант A — **Railway Postgres** (текущая схема): в проекте Railway →
**New → Database → PostgreSQL**, затем в сервисе API взять
`DATABASE_URL` из переменных плагина (`${{Postgres.DATABASE_URL}}`).

Вариант B — **Supabase**: [supabase.com](https://supabase.com) → **New project** →
**Settings → Database → Connection string → URI**.

> Supabase Auth в этом проекте **не обязателен** — авторизация через свой Express + JWT.

Строка подключения имеет вид:
`postgresql://postgres:[PASSWORD]@host:5432/railway`

---

## 2. Railway (backend)

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub** → репозиторий `MM05`.
2. Сервис подтянет `railway.toml` (или `railway.json`) из корня.
   `prisma migrate deploy` выполняется в `startCommand`, **не** на сборке:
   неудачный деплой не должен менять прод-БД до прохождения healthcheck.
3. **Variables** (из `backend/.env.example`):

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` или URI Supabase |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway подставит свой — можно не задавать) |
| `FRONTEND_URL` | `https://ваш-домен.vercel.app` — без слэша |
| `CORS_ORIGINS` | доп. origin'ы через запятую (опционально) |
| `JWT_ACCESS_SECRET` | 32+ символов (random hex) |
| `JWT_REFRESH_SECRET` | другой random hex |
| `CSRF_SECRET` | random hex |
| `COOKIE_SAME_SITE` | `none` (разные домены) / `lax` (свой домен) |
| `PAYMENT_PROVIDER` | `YOOKASSA` или `STRIPE` (по умолчанию) |
| `STRIPE_SECRET_KEY` | нужен только при `PAYMENT_PROVIDER=STRIPE` |
| `STRIPE_WEBHOOK_SECRET` | нужен только при `PAYMENT_PROVIDER=STRIPE` |
| `YOOKASSA_SHOP_ID` / `YOOKASSA_SECRET_KEY` | обязательны при `PAYMENT_PROVIDER=YOOKASSA` |
| `STOCK_RESERVATION_TTL_MINUTES` | `60` — через сколько минут снимать неоплаченный резерв |
| `SMTP_*` | по желанию |

Секреты:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. После первого деплоя — **создать админа** (Railway CLI или одноразовая команда):
```bash
railway link
railway run npm run create-admin
```
(из папки `backend`, с теми же env.)

5. Скопируйте **публичный URL** API, например:  
   `https://mm05-production.up.railway.app`

6. Healthcheck: `GET https://.../health/live` → 200 (liveness, без запроса к БД).
   `GET /health/ready` проверяет БД отдельно.

---

## 3. Vercel (frontend)

**Settings → Environment Variables** (Production):

| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | `https://ВАШ-RAILWAY-URL/api` — обязательно с `/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (только если используется Stripe) |
| `VITE_APP_URL` | `https://ваш-домен.vercel.app` |
| `VITE_SENTRY_DSN` | опционально, иначе фронтовый Sentry не активируется |

`FRONTEND_URL` в Railway должен совпадать с доменом Vercel, иначе CORS
отклонит запросы. После превью-деплоя появится новый origin — либо добавьте
его в `CORS_ORIGINS`, либо включите `ALLOW_VERCEL_PREVIEWS=true`.

Опционально (legacy Supabase client в коде):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

После смены env → **Redeploy**.

---

## 4. Stripe Webhook (только при PAYMENT_PROVIDER=STRIPE)

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Endpoint: `https://ВАШ-RAILWAY-URL/api/webhook`
3. События: `checkout.session.completed`, `payment_intent.succeeded` (по вашей логике)
4. Секрет → `STRIPE_WEBHOOK_SECRET` в Railway

**ЮKassa (СБП):** webhook URL тот же — `https://ВАШ-RAILWAY-URL/api/webhook`.
Подпись не используется: запрос принимается по IP-allowlist официальных сетей
ЮKassa, статус платежа перезапрашивается через API и сумма сверяется с заказом.
Если ЮKassa ходит через свой прокси, задайте `YOOKASSA_WEBHOOK_IPS`.

---

## 5. Локальный запуск (проверка)

```bash
# Корень — фронт
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api

npm install
npm run dev

# Backend
cd backend
cp .env.example .env
# DATABASE_URL = Supabase URI или локальный Postgres
npm install
npm run db:generate
npm run db:push   # или db:migrate
npm run create-admin
npm run dev
```

---

## 6. Чеклист «всё работает»

- [ ] `https://сайт.vercel.app` открывается
- [ ] `https://api.../health` → OK
- [ ] Логин / регистрация
- [ ] Корзина и checkout (Stripe test card `4242...`)
- [ ] Админка `/admin` с мобильного (бургер-меню)

---

## Архитектура

```
Браузер → Vercel (React)
              ↓ VITE_API_URL
         Railway (Express + Prisma)
              ↓ DATABASE_URL
         Supabase (PostgreSQL)
```
