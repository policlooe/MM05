# Деплой MM05: Vercel + Railway + Supabase

Схема: **фронт** на Vercel, **API** на Railway, **PostgreSQL** в Supabase (Prisma).

---

## 1. Supabase (база данных)

1. [supabase.com](https://supabase.com) → **New project**.
2. **Settings → Database → Connection string → URI** (режим **Session** или **Direct** для Railway).
3. Скопируйте `DATABASE_URL`, вид:  
   `postgresql://postgres.[ref]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

> Supabase Auth в этом проекте **не обязателен** — авторизация через ваш Express + JWT. Supabase здесь = только Postgres.

4. (Опционально) **SQL Editor** — можно проверить подключение.

---

## 2. Railway (backend)

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub** → репозиторий `MM05`.
2. Сервис подтянет `railway.toml` из корня.
3. **Variables** (из `backend/.env.example`):

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | URI из Supabase |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway подставит свой — можно не задавать) |
| `FRONTEND_URL` | `https://ваш-домен.vercel.app` |
| `JWT_ACCESS_SECRET` | 32+ символов (random hex) |
| `JWT_REFRESH_SECRET` | другой random hex |
| `CSRF_SECRET` | random hex |
| `STRIPE_SECRET_KEY` | `sk_test_...` или live |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
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

6. Healthcheck: `GET https://.../health` → 200.

---

## 3. Vercel (frontend) — уже настроен

**Settings → Environment Variables** (Production):

| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | `https://ВАШ-RAILWAY-URL/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `VITE_APP_URL` | `https://ваш-домен.vercel.app` |

Опционально (legacy Supabase client в коде):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

После смены env → **Redeploy**.

---

## 4. Stripe Webhook

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Endpoint: `https://ВАШ-RAILWAY-URL/api/webhook`
3. События: `checkout.session.completed`, `payment_intent.succeeded` (по вашей логике)
4. Секрет → `STRIPE_WEBHOOK_SECRET` в Railway

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
