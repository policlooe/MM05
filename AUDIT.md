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

- ~~**Два типа конфигуратора товара**~~ — ✅ исправлено: единый модуль `src/types/product-configuration.ts`; legacy `product-config.ts` и `ProductConfiguratorV2` удалены.
- ~~**Dashboard** использует `Navbar`/`Footer`~~ — ✅ исправлено: переведён на `AdminLayout`.
- **Статусы заказов** в UI (`PENDING`) не совпадают с Prisma enum (`NEW`, `RESERVED`, `CONFIRMED`…).
- **OrderDetail** ожидает `shippingAddress` объект, API отдаёт `deliveryAddress: string` — нужен адаптер или правка UI.
- **Данные каталога** частично в `src/data/products.ts` (статика), частично через API — для production лучше один источник (API + React Query).
- **Lighthouse**: прогнать mobile; цели LCP < 2.5s, CLS < 0.1 (баннеры уже оптимизированы).

### Backend (`engineering-backend-architect`)

- ~~**Платежи только Stripe, СБП отсутствует**~~ — ✅ сделано (инструкция п.8): провайдер-агностичный контур. ЮKassa API v3 + СБП (`yookassa.service.ts`), общий идемпотентный фулфилмент `order-payment.service.ts` (условный updateMany-claim: ретраи вебхуков не задваивают оплату/склад/письма). Вебхук `/api/webhook/yookassa`: IP-allowlist официальных сетей (CIDR-матчер в `payment.helpers.ts`), статус НИКОГДА не берётся из уведомления — обязательный аутентифицированный GET платежа + сверка суммы с total заказа. Поллинг статуса для фронта: `GET /api/payment/order/:id/status` (владелец/админ/`?pid=`-capability). Провайдер выбирается `PAYMENT_PROVIDER` env. Проверки: юнит 11/11 (`npm run test:unit`), интеграционный смоук 6/6 против мок-ЮKassa (`npm run smoke:sbp`). Для боевого приёма СБП останется завести мерчант-аккаунт и вписать ключи + URL вебхука.
- **Prisma migrations** — папки без `_prisma_migrations`; на Railway использовать `prisma db push` или оформить полноценные migrate.
- **Singleton PrismaClient** — в каждом controller свой `new PrismaClient()`; вынести в `lib/prisma.ts`.
- **Кэш** — GET `/api/products` без Cache-Control / Redis; при росте нагрузки добавить.
- **CORS** — один `FRONTEND_URL`; для preview Vercel нужен список origins.
- **Отсутствуют** admin endpoints: categories CRUD, settings, analytics (страницы есть, API частично).

- **Статусы заказов** в UI (`PENDING`) не совпадают с Prisma enum (`NEW`, `RESERVED`, `CONFIRMED`…).

### Security (`engineering-security-engineer`)

- Rate limit уже есть (login/register/api) — хорошо.
- JWT в httpOnly cookies — хорошо.
- CSRF на state-changing — хорошо; убедиться что `initCsrfProtection()` вызывается до первого POST.
- **Admin API** защищён middleware — хорошо; фронт теперь дублирует через `AdminRoute`.

### Testing / Reality (`testing-reality-checker`)

- Нет e2e (Playwright) на checkout и admin flow.
- `npm test` — только example; нет интеграционных тестов API.
- Dashboard stats ���������� � `GET /api/admin/stats`.

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
- Stripe webhook — обязателен на Railway URL; при PAYMENT_PROVIDER=YOOKASSA — вебхук `https://<backend>/api/webhook/yookassa` в ЛК ЮKassa (события payment.succeeded / payment.canceled).
- Удалить неиспользуемый Supabase client или перевести auth на него целиком (сейчас гибрид).

---

## Платежи: СБП через ЮKassa (задача 8 инструкции) — ✅ реализовано 2026-08-24

Архитектура провайдер-агностична: выбор через `PAYMENT_PROVIDER=STRIPE|YOOKASSA`.

- **Создание оплаты** (`backend/src/services/yookassa.service.ts`): официальный REST v3, Basic-auth, способ `sbp`, redirect-подтверждение. Сумму считает бэкенд из заказа (`orders.total`), фронт получает только `confirmation_url`. Идемпотентность: активный платёж переиспользуется, каждой новой попытке — свежий Idempotence-Key (сохраняется в `orders.idempotency_key`).
- **Вебхук** (`webhook.controller.handleYookassaWebhook`): IP-allowlist официальных сетей (CIDR-матчер, переопределяется `YOOKASSA_WEBHOOK_IPS`) → обязательная серверная верификация аутентифицированным GET (статус из тела уведомления не доверяется) → сверка суммы с `orders.total` → идемпотентный переход статуса.
- **Общий фулфилмент** (`order-payment.service.ts`): условный `updateMany` «захватывает» заказ только из payable-состояния; ретраи вебхука не дублируют salesCount/очистку корзины/письмо. Stripe переведён на тот же модуль.
- **Статус для поллинга**: `GET /api/payment/order/:orderId/status?pid=<providerPaymentId>` (владелец/админ/capability-token). Фронт (`PaymentSuccess.tsx`) подтверждает оплату поллингом, не доверяя факту возврата на success-URL.
- **Миграция**: `add_payment_provider` — колонки `payment_provider`, `provider_payment_id` (+index).
- **Проверено**: юнит-тесты хелперов 11/11 (`npm run test:unit`); интеграционный смоук против мока API ЮKassa 6/6 (`npm run smoke:sbp`): недоверенный IP→403, битый JSON→400, неизвестный платёж→500(ретрай), нет orderId→ignore, подделка статуса отклонена, Idempotence-Key обязателен. Полный цикл с реальной БД — в E2E (задача 27).
- Найдено и исправлено попутно: `/32` в CIDR-матчере пропускал все адреса; Sentry-профайлер ронял старт бэкенда без нативного бинарника (теперь опционален).

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
