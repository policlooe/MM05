# MM05 — Аудит проекта (май 2026)

Оценка по ролям из `.kiro/skills/`: Frontend Developer, Backend Architect, Security Engineer, Performance Benchmarker, Accessibility Auditor, Reality Checker.

**Итоговая оценка: B- (рабочий MVP, не «идеал» без 2–3 итераций)**

---

## Критично (исправлено в этом коммите)

| # | Проблема | Агент |
|---|----------|--------|
| 1 | Админ-роуты без `AdminRoute` — любой мог открыть `/admin` | Security |
| 2 | Нет роутов `/admin/orders`, `/admin/users` в `App.tsx` | Frontend |
| 3 | `GET /admin/orders/:id` отсутствовал на backend | Backend |
| 4 | `OrderDetail` вызывал `PATCH` вместо `PUT` | Backend |
| 5 | Prisma `sqlite` в schema при деплое на Supabase Postgres | Backend |
| 6 | Нет `ErrorBoundary` на корне приложения | Frontend |

---

## Высокий приоритет (следующий спринт)

### Frontend (`engineering-frontend-developer`)

- **Два типа конфигуратора товара** — `product-config.ts` и `product-configuration.ts`; объединить в один модуль.
- **Dashboard** (`pages/admin/Dashboard.tsx`) использует `Navbar`/`Footer`, а не `AdminLayout` — несогласованный UX админки.
- **Статусы заказов** в UI (`PENDING`) не совпадают с Prisma enum (`NEW`, `RESERVED`, `CONFIRMED`…).
- **OrderDetail** ожидает `shippingAddress` объект, API отдаёт `deliveryAddress: string` — нужен адаптер или правка UI.
- **Данные каталога** частично в `src/data/products.ts` (статика), частично через API — для production лучше один источник (API + React Query).
- **Lighthouse**: прогнать mobile; цели LCP < 2.5s, CLS < 0.1 (баннеры уже оптимизированы).

### Backend (`engineering-backend-architect`)

- **Prisma migrations** — папки без `_prisma_migrations`; на Railway использовать `prisma db push` или оформить полноценные migrate.
- **Singleton PrismaClient** — в каждом controller свой `new PrismaClient()`; вынести в `lib/prisma.ts`.
- **Кэш** — GET `/api/products` без Cache-Control / Redis; при росте нагрузки добавить.
- **CORS** — один `FRONTEND_URL`; для preview Vercel нужен список origins.
- **Отсутствуют** admin endpoints: categories CRUD, settings, analytics (страницы есть, API частично).

### Security (`engineering-security-engineer`)

- Rate limit уже есть (login/register/api) — хорошо.
- JWT в httpOnly cookies — хорошо.
- CSRF на state-changing — хорошо; убедиться что `initCsrfProtection()` вызывается до первого POST.
- **Admin API** защищён middleware — хорошо; фронт теперь дублирует через `AdminRoute`.

### Testing / Reality (`testing-reality-checker`)

- Нет e2e (Playwright) на checkout и admin flow.
- `npm test` — только example; нет интеграционных тестов API.
- Dashboard stats — `TODO: Fetch from API` (мок/нули).

### Accessibility (`testing-accessibility-auditor`)

- Skip link, focus trap в корзине — есть.
- Проверить контраст `muted-foreground` на мобильных.
- Админ-таблицы: `scope` на `<th>`, подписи для icon-only кнопок.

### SEO (`marketing-seo-specialist`)

- Meta в `index.html` + `SEO.tsx` — ок.
- `og.png` из hero — ок; для соцсетей лучше брендированный 1200×630.
- `sitemap.xml` — проверить актуальность slug товаров.

---

## Средний приоритет

- Service Worker в production — кэш статики; версионировать при деплое.
- Sentry подключён на backend; на фронте — проверить `VITE_SENTRY_DSN`.
- Stripe webhook — обязателен на Railway URL.
- Удалить неиспользуемый Supabase client или перевести auth на него целиком (сейчас гибрид).
- `FRONTEND_CODE_PART2.json` в репо — удалить если есть (мусор).

---

## Что уже хорошо

- Vite code splitting, lazy routes
- CSRF + refresh token flow
- Helmet, validation (Zod), admin middleware
- Safari/performance правки (баннеры, без backdrop-blur на scroll)
- Mobile admin sidebar (off-canvas)
- `useScrollLock` единый для корзины и каталога
- `DEPLOY.md` для Vercel + Railway + Supabase

---

## Рекомендуемый порядок работ

1. `prisma db push` / migrate на Supabase + `create-admin`
2. Vercel `VITE_API_URL` → Railway
3. Синхронизировать статусы заказов UI ↔ Prisma
4. Подключить Dashboard к `GET /api/admin/stats`
5. E2E smoke: главная → каталог → checkout (test mode)
