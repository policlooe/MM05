# Changelog

Все значимые изменения в проекте MM05 документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и проект следует [Semantic Versioning](https://semver.org/lang/ru/).

## [1.1.1] - 2026-05-26

### Исправлено

#### 🚂 Railway Deploy Fixes
- Исправлена версия Stripe API: `2025-02-24.acacia` → `2024-11-20.acacia`
- Добавлен недостающий пакет `csrf-csrf@3.0.4` в dependencies
- Исправлены TypeScript типы для Stripe:
  - `Stripe.Checkout.Session` → `Stripe.Response<Stripe.Checkout.Session>`
  - `Stripe.Refund` → `Stripe.Response<Stripe.Refund>`
- Добавлен type guard для `session.payment_intent`

#### 📝 Документация
- Создан `docs/RAILWAY_DEPLOY_FIX.md` - подробное руководство по исправлению ошибок деплоя
- Создан `DEPLOY_INSTRUCTIONS.md` - быстрая инструкция по деплою

### Файлы изменены
- `backend/src/controllers/checkout.controller.ts`
- `backend/src/services/stripe.service.ts`
- `package.json`

## [1.1.0] - 2026-05-26

### Добавлено

#### 🧪 Тестирование
- Unit тесты для `analytics.ts` (8 тестов, 100% coverage)
- Unit тесты для `payment.ts` (7 тестов, 100% coverage)
- Unit тесты для `contacts.ts` (6 тестов, 100% coverage)
- Документация по тестированию (`docs/TESTING.md`)

#### 🔒 Безопасность
- Rate limiting для checkout запросов (3 сек cooldown)
- Custom error class `PaymentError` с типизированными кодами
- Улучшенная валидация Stripe URLs
- Try-catch блоки для всех критических операций

#### 🍪 GDPR Compliance
- Cookie consent banner компонент (`CookieConsent.tsx`)
- Функции управления согласием: `setAnalyticsConsent()`, `getAnalyticsConsent()`
- Google Consent Mode интеграция
- localStorage persistence для выбора пользователя

#### 🛡️ Error Handling
- Error Boundary компонент с красивым fallback UI
- Интеграция с Sentry для production
- Dev mode с детальной информацией об ошибках
- Кнопки "Попробовать снова" и "На главную"

#### 📚 Документация
- `docs/IMPROVEMENTS.md` - Подробное описание всех улучшений
- `docs/TESTING.md` - Руководство по тестированию
- Обновлен `README.md` с новыми возможностями

### Изменено

#### Analytics (`src/lib/analytics.ts`)
- Добавлена проверка consent перед tracking
- Error handling для всех tracking функций
- Улучшена инициализация с consent management

#### Payment Service (`src/services/payment.ts`)
- Переписаны все методы с улучшенной обработкой ошибок
- Добавлены русские сообщения об ошибках
- Улучшена типизация с custom error types

### Исправлено
- Исправлена проблема с Google Maps API key в `ContactUs.tsx`
- Улучшена логика определения платформы в `buildMapsUrl()`
- Исправлены предупреждения линтера

## [1.0.0] - 2026-05-25

### Добавлено
- Первый production-ready релиз
- Полный функционал e-commerce
- Google Analytics 4 интеграция
- Sentry error tracking
- Database backups
- WCAG 2.1 Level AA accessibility
- SEO оптимизация
- Mobile responsive design

### Технологии
- React 18 + TypeScript
- Vite для сборки
- TailwindCSS для стилей
- Express backend
- PostgreSQL + Prisma
- Stripe для платежей

---

## Типы изменений

- `Добавлено` - новые возможности
- `Изменено` - изменения в существующем функционале
- `Устарело` - функционал, который скоро будет удален
- `Удалено` - удаленный функционал
- `Исправлено` - исправления багов
- `Безопасность` - исправления уязвимостей

## Ссылки

- [Unreleased]: https://github.com/policlooe/MM05/compare/v1.1.1...HEAD
- [1.1.1]: https://github.com/policlooe/MM05/compare/v1.1.0...v1.1.1
- [1.1.0]: https://github.com/policlooe/MM05/compare/v1.0.0...v1.1.0
- [1.0.0]: https://github.com/policlooe/MM05/releases/tag/v1.0.0
