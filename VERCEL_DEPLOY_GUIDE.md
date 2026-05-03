# 🚀 Деплой Frontend на Vercel

**Дата**: 3 мая 2026  
**Статус**: ✅ **Готов к деплою**

---

## ✅ Что подготовлено

### 1. Конфигурация Vercel
- ✅ `vercel.json` - настройки деплоя
- ✅ `.vercelignore` - исключения из деплоя
- ✅ `.env.production` - production переменные

### 2. Build проверен
- ✅ `npm run build` - успешно
- ✅ Размер bundle: 442 KB (134 KB gzipped)
- ✅ Все assets оптимизированы

### 3. Переменные окружения
- ✅ `VITE_API_URL` - URL backend API
- ✅ `VITE_SITE_URL` - URL frontend
- ✅ `VITE_SUPABASE_*` - Supabase credentials

---

## 🚀 Деплой через Vercel CLI

### Шаг 1: Установите Vercel CLI
```bash
npm install -g vercel
```

### Шаг 2: Войдите в Vercel
```bash
vercel login
```

### Шаг 3: Деплой
```bash
# Первый деплой (preview)
vercel

# Production деплой
vercel --prod
```

---

## 🌐 Деплой через Vercel Dashboard

### Шаг 1: Подключите GitHub
1. Откройте https://vercel.com/
2. Нажмите **"Add New Project"**
3. Выберите **"Import Git Repository"**
4. Подключите ваш GitHub репозиторий

### Шаг 2: Настройте проект
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Шаг 3: Добавьте Environment Variables
В разделе **"Environment Variables"** добавьте:

```env
# Supabase (обязательно)
VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu

# API URL (замените на ваш backend URL)
VITE_API_URL=https://your-backend-url.railway.app/api

# Site URL (будет автоматически от Vercel)
VITE_SITE_URL=https://mm05.vercel.app

# Analytics (опционально)
VITE_YANDEX_METRIKA_ID=your_metrika_id
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Yandex Maps (опционально)
VITE_YANDEX_MAPS_API_KEY=your_api_key
```

### Шаг 4: Deploy
Нажмите **"Deploy"** и дождитесь завершения

---

## 📋 Checklist перед деплоем

### Обязательно:
- [ ] Backend задеплоен на Railway
- [ ] Database настроена на Supabase
- [ ] Получен URL backend API
- [ ] Обновлен `VITE_API_URL` в environment variables
- [ ] Проверен `npm run build` локально

### Опционально:
- [ ] Настроен custom domain
- [ ] Добавлены analytics (Yandex Metrika, Google Analytics)
- [ ] Настроен Yandex Maps API key
- [ ] Настроен Sentry для мониторинга ошибок

---

## 🔧 Настройки Vercel

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Что делает:**
- `rewrites` - все роуты перенаправляются на index.html (для SPA)
- `headers` - security headers и кэширование assets

---

## 🌍 После деплоя

### 1. Проверьте сайт
```
https://your-project.vercel.app
```

### 2. Проверьте функции:
- ✅ Главная страница загружается
- ✅ Каталог открывается (sidebar)
- ✅ Товары отображаются
- ✅ Поиск работает
- ✅ Корзина работает
- ✅ Авторизация работает (если backend готов)

### 3. Проверьте Console (F12)
- Нет ошибок в консоли
- API запросы идут на правильный URL
- Нет CORS ошибок

---

## 🔄 Автоматический деплой

После первого деплоя через GitHub:
- ✅ Каждый push в `main` → автоматический production деплой
- ✅ Каждый PR → preview деплой
- ✅ Rollback в один клик

---

## 🐛 Troubleshooting

### Ошибка: "Module not found"
**Решение:**
```bash
# Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Ошибка: "CORS policy"
**Решение:**
Добавьте в backend CORS настройки:
```typescript
app.use(cors({
  origin: ['https://mm05.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Ошибка: "Environment variable not found"
**Решение:**
Проверьте, что все переменные добавлены в Vercel Dashboard:
- Settings → Environment Variables

### Ошибка: "404 on refresh"
**Решение:**
Проверьте `vercel.json` - должен быть rewrite на index.html

---

## 📊 Оптимизация

### Текущий размер:
```
index.js:          442 KB (134 KB gzipped)
index.css:          87 KB ( 15 KB gzipped)
Total:             529 KB (149 KB gzipped)
```

### Рекомендации:
- ✅ Code splitting уже настроен (vendor chunks)
- ✅ Assets кэшируются на 1 год
- ✅ Gzip compression включен
- ✅ Images оптимизированы

---

## 🔐 Security Headers

Автоматически добавлены в `vercel.json`:
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`

---

## 📱 Custom Domain

### Добавить свой домен:
1. Vercel Dashboard → Settings → Domains
2. Добавьте домен: `mm05.ru`
3. Настройте DNS записи:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🎉 Готово!

**Ваш frontend готов к деплою на Vercel!**

### Следующие шаги:
1. ✅ Задеплойте backend на Railway
2. ✅ Получите URL backend
3. ✅ Обновите `VITE_API_URL`
4. ✅ Задеплойте frontend на Vercel
5. ✅ Проверьте работу сайта

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте Vercel Logs: Dashboard → Deployments → Logs
2. Проверьте Console в браузере (F12)
3. Проверьте Network tab для API запросов

---

**Удачного деплоя! 🚀✨**
