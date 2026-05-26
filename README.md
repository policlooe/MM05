# 🛋️ MM05 - Мебельный интернет-магазин

Современный интернет-магазин мебели из массива дерева с полным функционалом e-commerce.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build
```

## ✨ Возможности

- 🛒 **E-commerce**: Полная корзина, оформление заказов, оплата Stripe
- 📊 **Analytics**: Google Analytics 4 + Web Vitals мониторинг + GDPR consent
- ♿ **Accessibility**: WCAG 2.1 Level AA
- 🎨 **UI/UX**: Современный дизайн, адаптивная верстка
- 🔐 **Auth**: JWT авторизация, роли пользователей
- 📱 **Mobile**: Полная поддержка мобильных устройств
- ⚡ **Performance**: Code splitting, lazy loading, оптимизация
- 🔍 **SEO**: Meta tags, Open Graph, sitemap
- 💾 **Database**: PostgreSQL + Prisma ORM
- 🔄 **Backups**: Автоматические бэкапы (30 дней)
- 🧪 **Testing**: Unit тесты с Vitest + Testing Library
- 🛡️ **Error Handling**: Error Boundary + Sentry integration
- 🍪 **GDPR**: Cookie consent banner + analytics consent management
- 🔒 **Security**: Rate limiting, URL validation, custom error types

## 📁 Структура проекта

```
├── src/
│   ├── components/     # React компоненты
│   ├── pages/          # Страницы приложения
│   ├── lib/            # Утилиты (analytics, sentry)
│   ├── store/          # State management (Zustand)
│   ├── data/           # Данные товаров
│   └── types/          # TypeScript типы
├── backend/
│   ├── src/            # Backend код (Express)
│   ├── prisma/         # Database schema
│   └── scripts/        # Утилиты (бэкапы)
└── .github/
    └── workflows/      # CI/CD (автобэкапы)
```

## 🛠️ Технологии

### Frontend
- **React 18** + TypeScript
- **Vite** - сборка
- **TailwindCSS** - стили
- **Framer Motion** - анимации
- **React Query** - data fetching
- **Zustand** - state management
- **React Router** - роутинг

### Backend
- **Node.js** + Express
- **PostgreSQL** + Prisma
- **JWT** - авторизация
- **Stripe** - платежи
- **Nodemailer** - email

### DevOps
- **GitHub Actions** - CI/CD
- **Railway/Render** - hosting
- **Vercel** - frontend

## 📊 Мониторинг

- **Sentry** - отслеживание ошибок
- **Google Analytics 4** - веб-аналитика
- **Web Vitals** - производительность

## 🔧 Настройка

### 1. Environment Variables

Создайте `.env.local`:

```bash
# API
VITE_API_URL=http://localhost:3000

# Analytics (опционально)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup

```bash
npm install
npm run dev
```

## 📦 Деплой

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway)
```bash
railway up
```

## 📚 Документация

- `docs/IMPROVEMENTS.md` - Последние улучшения и новые возможности
- `docs/TESTING.md` - Руководство по тестированию
- `ACCESSIBILITY_ANALYTICS_COMPLETE.md` - Accessibility & Analytics
- `MONITORING_SETUP_GUIDE.md` - Настройка мониторинга
- `FINAL_CHECKLIST.md` - Чеклист перед запуском
- `CHANGELOG.md` - История изменений

## ✅ Production Ready

- [x] Accessibility (WCAG AA)
- [x] Analytics & Monitoring
- [x] Database Backups
- [x] Error Tracking
- [x] Performance Optimization
- [x] SEO Optimization
- [x] Security (Helmet, CORS, Rate Limiting)
- [x] Unit Testing (Vitest)
- [x] Error Boundaries
- [x] GDPR Compliance (Cookie Consent)
- [x] Payment Security (Rate Limiting, URL Validation)

## 📄 Лицензия

MIT

## 👥 Команда

Разработано с использованием AI-агентов:
- Product Manager
- Frontend Developer
- Backend Architect
- Accessibility Auditor
- Data Engineer

---

**Версия:** 1.0.0  
**Статус:** ✅ Production Ready
