# MM05 — Аудит проекта

Две итерации: май 2026 (первый проход) и октябрь 2026 (полный разбор по ролям
ECC-агентов). Ниже — что проверялось, что исправлено и что осталось.

**Текущая оценка: B (MVP, готов к запуску после закрытия блока «Критично» в
разделе «Осталось»).**

---

## Как проходил аудит (октябрь 2026)

| Роль (ECC) | Область | Результат |
|---|---|---|
| `security-reviewer` | auth, платежи, webhook, CSRF, IDOR | 1 HIGH-класс (резервы), 2 HIGH (refund, XSS в письмах), 6 MEDIUM |
| `database-reviewer` | Prisma, миграции, транзакции | 3 критичных для денег дефекта |
| `react-reviewer` | checkout, оплата, admin UI | оформление заказа было невозможно (id + конфигурация) |
| `e2e-runner` / QA | CI, деплой, бэкапы, тесты | миграции на сборке, пустые бэкапы, 0 тестов на деньги |

Прогнано вручную: `tsc -p tsconfig.app.json --noEmit` — чисто;
`tsc -p backend/tsconfig.json --noEmit` — чисто; `eslint .` — 0 ошибок,
23 предупреждения (`no-explicit-any`, `exhaustive-deps`).
`vitest` в песочнице не запускается (`spawn EPERM`), тесты гоняются в CI.

---

## Исправлено в этой итерации

### Деньги и заказы

| Проблема | Файл | Что сделано |
|---|---|---|
| Серверный расчёт цены не понимал фактическую форму `configuration` (карта, а не массив) → модификаторы не начислялись, `total` не совпадал с клиентским и **любой сконфигурированный заказ падал 409** | `backend/src/utils/pricing.ts` | Поддержаны обе формы (карта и массивы), значения читаются из `options[].priceModifier`, `values[].price`, `options[].price`; «сборка» не считается дважды |
| Ключ идемпотентности заказа перезаписывался ключом платежа ЮKassa → повторный сабмит создавал **второй заказ и второе списание склада** | `backend/src/services/yookassa.service.ts` | `idempotencyKey` больше не трогается после создания заказа |
| Проверка идемпотентности не сверяла покупателя → по чужому ключу отдавались имя, телефон, адрес и состав заказа | `backend/src/controllers/order.create.controller.ts` | Сверка `userId` + `customerPhone`, при несовпадении 409 без данных; гонка на уникальном индексе обрабатывается (P2002 → возврат существующего заказа) |
| Поллинг статуса оплаты писал `paymentStatus` напрямую, минуя фулфилмент → заказ **оплачен, но не подтверждён**: без `paidAt`, списания стока, `salesCount`, очистки корзины и письма | `backend/src/controllers/payment.controller.ts` | Поллинг идёт через `fulfillPaidOrder` / `failOrder`, ответ перечитывается из БД |
| Фулфилмент требовал `status = RESERVED` → если админ подтвердил заказ до вебхука, оплата не учитывалась | `backend/src/services/order-payment.service.ts` | Условие по статусу убрано, `CONFIRMED` ставится только из `NEW`/`RESERVED` |
| Возврат средств: вызов Stripe **внутри транзакции** (деньги вернулись, транзакция откатилась) и любой частичный возврат отменял заказ и возвращал весь товар на склад | `backend/src/controllers/payment.controller.ts` | Атомарный захват `SUCCEEDED → PROCESSING`, Stripe вне транзакции, откат статуса при ошибке, частичный возврат не отменяет заказ, проверка суммы |
| Дедлок при резервировании: товары блокировались в порядке клиента | `backend/src/controllers/order.create.controller.ts` | Захват строк в едином порядке (`productId`), 40P01 больше не возникает |
| Брошенные оформления держали склад вечно (публичный `POST /api/orders` + нет снятия резерва) | `backend/src/services/reservation-sweeper.service.ts` (новый), `backend/src/server.ts` | Фоновый sweeper раз в 5 минут снимает резервы старше `STOCK_RESERVATION_TTL_MINUTES` (по умолчанию 60) и возвращает товар |

### Frontend

| Проблема | Файл | Что сделано |
|---|---|---|
| ЮKassa-редирект отвергался allowlist'ом (провайдер не передавался), заказ выглядел «не созданным» | `src/pages/Checkout.tsx` | `provider` передаётся в `redirectToCheckout`; при сбое редиректа — переход на `/checkout/success` с номером заказа вместо ложной ошибки |
| Ключ идемпотентности генерировался заново на каждый сабмит | `src/pages/Checkout.tsx` | Один ключ на попытку (`useRef`), повтор после сетевой ошибки возвращает тот же заказ; `sessionId` платежа сохраняется для поллинга |
| 401 на `/auth/login` перезагружал страницу → сообщение «неверный пароль» не показывалось; параллельные 401 ломали ротацию refresh | `src/services/api.ts` | Single-flight refresh, CSRF-заголовок на `/auth/refresh`, auth-эндпоинты исключены из авто-refresh |
| `/admin/products/new` не распознавался как создание → PUT на `/undefined`, товар не создавался | `src/pages/admin/ProductEdit.tsx` | `isNew = !id || id === 'new'` |
| Корзина очищалась при возврате с оплаты до подтверждения → терялась возможность повторить оплату | `src/pages/PaymentSuccess.tsx` | Очистка только при `confirmed`, в поллинг передаётся `pid` (capability для гостя) |
| Две конфигурации одного товара давали одинаковый React-ключ | `src/components/CartSidebar.tsx` | `key={item.cartItemKey}` |

### Безопасность и эксплуатация

| Проблема | Файл | Что сделано |
|---|---|---|
| HTML-инъекция в письма: имя/телефон/адрес подставлялись как есть → фишинг с домена магазина на чужой email | `backend/src/services/email.service.ts` | `escapeHtml()` на всех пользовательских полях обоих шаблонов |
| Миграции выполнялись на этапе сборки (прод-БД менялась до healthcheck, откат невозможен) | `railway.json`, `railway.toml`, `nixpacks.toml` | `prisma migrate deploy` перенесён в `startCommand` |
| Healthcheck `/health` делал `SELECT 1` → сбой Supabase рестартовал живой контейнер | `railway.json`, `railway.toml` | `/health/live` |
| Бэкап: `pg_dump \| gzip` возвращал код gzip, упавший дамп считался успешным и вытеснял валидные бэкапы | `backend/scripts/backup-database.ts` | `bash -o pipefail`, пароль через окружение, проверка размера файла |
| Workflow бэкапа искал файлы в `backend/backups` (скрипт пишет в `backups/`), артефакт был пустым, но зелёным | `.github/workflows/database-backup.yml` | Путь исправлен, `if-no-files-found: error`, Node 22 |
| В примерах окружения не было переменных ЮKassa, TTL резерва и `VITE_SENTRY_DSN` | `.env.example`, `backend/.env.example` | Добавлены |

### Деплой-связка Vercel (фронт) + Railway (API и БД)

| Проблема | Файл | Что сделано |
|---|---|---|
| Cookie ставились с `SameSite=strict`, а `vercel.app` и `up.railway.app` — разные сайты: браузер не отправляет auth/CSRF cookie на POST, логин и заказ падают 401/403 | `backend/src/utils/cookies.ts` (новый), `auth.controller.ts`, `csrf.middleware.ts` | Единая политика: `COOKIE_SAME_SITE=none` в production (с принудительным `Secure`), `lax` для своего домена; `__Host-` для CSRF включается по `Secure`, а не по `NODE_ENV` |
| CORS с `credentials: true` принимал **любой** `*.vercel.app` | `backend/src/app.ts` | Wildcard включается только `ALLOW_VERCEL_PREVIEWS=true`; по умолчанию — строгий список `FRONTEND_URL` + `CORS_ORIGINS` |
| Деплой только с ЮKassa не стартовал: `validateEnv` требовал Stripe-ключи, `stripe.service` бросал исключение на импорте | `validateEnv.ts`, `stripe.service.ts`, `webhook.controller.ts` | Stripe обязателен только при `PAYMENT_PROVIDER=STRIPE`; ключи ЮKassa стали реально обязательными при `YOOKASSA`; Stripe-вебхук отвечает 503, если провайдер отключён |
| `DEPLOY.md` описывал Supabase как БД и `/health` как healthcheck | `DEPLOY.md` | Схема «Railway Postgres + Railway API + Vercel», таблица переменных, `/health/live`, раздел про cookie и CORS, вебхук ЮKassa |

---

## Осталось: критично (до продакшена)

1. **Миграции и базовая линия.** `add_assembly_price`, `add_order_reservation`,
   `add_product_configuration` не имеют timestamp-префикса, а
   `20260824142421_add_payment_provider/migration.sql` использует
   `ADD COLUMN`/`CREATE INDEX` без `IF NOT EXISTS`. Прод инициализирован
   `db push`, `_prisma_migrations` пуст → `migrate deploy` упадёт с 42701/P3009.
   Нужно: baseline (`prisma migrate resolve --applied`) на живой БД и
   `IF NOT EXISTS` в этой миграции.
2. **Удаление товара — физическое.** `admin.controller.ts:257` вызывает
   `product.delete`; FK `ON DELETE CASCADE` на `reviews`/`cart_items` и
   `SET NULL` на `order_items.product_id` → удаление стирает отзывы, корзины
   всех пользователей и обнуляет товар в истории заказов. Нужен `deletedAt`
   (soft delete) + миграция + фильтр в выборках.
3. **Доставка не считается на сервере.** `createOrder` не принимает
   `deliveryMethod`/координаты, `total = subtotal`, поэтому курьерская доставка
   всегда бесплатна и сохраняется как самовывоз. Нужен серверный расчёт
   (`DELIVERY_BASE_PRICE`/`PER_KM` уже в `validateEnv.ts`) и поля в zod-схеме.

## Осталось: высокий приоритет

4. **Гонка смены статуса заказа.** `order-status.service.ts` читает статус, а
   затем пишет без условия → параллельные «отменить» и «отправить» оба
   проходят. Нужен `updateMany({ where: { id, status: expected } })`.
5. **Вебхуки без rate limit** (`/api/webhook` смонтирован до `apiLimiter`), а
   доверие к IP ЮKassa строится на `req.ip` при `trust proxy 1` — нужен
   доверенный CIDR и отдельный лимитер.
6. **Stripe не сверяет сумму/валюту** (`stripe.service.ts:97-112`): оплата
   принимается по типу события. Добавить `amount_total`, `currency`,
   `payment_status === 'paid'` перед фулфилментом.
7. **Тесты на деньги отсутствуют.** Первые пять: admin-auth (401/403/200),
   контракт вебхуков (подпись/IP), refresh с CSRF, резервирование склада,
   идемпотентность `fulfillPaidOrder`.

## Средний приоритет

- Номера заказов ломаются после 9999 в год (`parseInt` по строке, лексикографический `orderBy`).
- Email уникален с учётом регистра: `Ivan@` и `ivan@` — два аккаунта.
- Нет индексов `refresh_tokens.expires_at`, `products.created_at`, `audit_logs.entity_id`.
- `providerPaymentId` не уникален — повторная оплата того же заказа не отсекается на уровне БД.
- Корзина: read-modify-write без транзакции, количество может превысить остаток.
- `product.configuration` нельзя изменить через админку (нет поля в валидаторе).
- Sentry не подключён к error-middleware; `initSentry`/`initWebVitals` на фронте не вызываются.
- Ошибка загрузки списка заказов в админке показывается как «заказов нет».
- A11y: `aria-expanded` у аккордеона конфигуратора, `htmlFor` в форме товара, `aria-modal` у закрытой корзины.

## Низкий приоритет

- Дубли индексов в `0_init`, отсутствие CHECK-констрейнтов (`rating` 1–5, `quantity > 0`).
- Placeholder-тест `src/test/example.test.ts`; `docs/TESTING.md` описывает несуществующий `ContactUs.test.tsx`.
- Документация: `DEPLOY.md` ссылается на `npm run db:push` (нет такого скрипта), `create-admin` вместо `create:admin`.
- `backend/docker-compose.yml` с паролем по умолчанию и портом на все интерфейсы (dev-only).

---

## Что уже хорошо (проверено)

- Деньги в `Decimal(10,2)`, снимок цены в `productSnapshot`, `SET NULL` для истории заказов.
- Резервирование склада — атомарный `updateMany({ stockQuantity: { gte } })`.
- Идемпотентность фулфилмента через условный `updateMany`-захват.
- Stripe: проверка подписи на raw-body до `express.json`; ЮKassa: перезапрос платежа и сверка суммы.
- Refresh-токены хранятся хэшем и ротируются в транзакции; секреты падают fail-fast.
- Cookies `httpOnly` + `secure` в проде, CSRF на всех не-GET `/api`, helmet + CSP.
- Инвойс экранирует поля и проверяет владельца/админа, админ-роутер закрыт middleware.

---

## Рекомендуемый порядок работ

1. Baseline миграций на проде + soft delete товаров + серверная доставка.
2. Пять тестов из п.9 и включение backend-тестов в CI (`backend/package.json` → `test:unit`).
3. Смена статусов через условный `updateMany`, CORS-allowlist, лимитер на вебхуки.
4. Проверка CSRF на реальном cross-site checkout (Vercel → Railway).
5. Индексы и уникальность `providerPaymentId`, нормализация email.
