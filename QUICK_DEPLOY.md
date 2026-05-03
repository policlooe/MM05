# ⚡ Быстрый деплой на Vercel

## 🚀 Через Vercel Dashboard (рекомендуется)

### 1. Откройте Vercel
https://vercel.com/

### 2. Импортируйте проект
- Нажмите **"Add New Project"**
- Выберите **"Import Git Repository"**
- Подключите GitHub репозиторий

### 3. Настройки
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Environment Variables
Добавьте в Vercel Dashboard:

```env
VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3FubHN3bHRkcXFqbWZvZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzI2MDQsImV4cCI6MjA5MjgwODYwNH0.TUOsZEh81FG_QscwJ_WcwiWRD88nWtDAuJ1U_dKr8Lg
VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu
VITE_API_URL=https://your-backend-url.railway.app/api
```

### 5. Deploy
Нажмите **"Deploy"** ✅

---

## 💻 Через CLI

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите
vercel login

# Деплой
vercel --prod
```

---

## ✅ Что готово

- ✅ `vercel.json` - конфигурация
- ✅ `.vercelignore` - исключения
- ✅ `.env.production` - переменные
- ✅ Build проверен - работает

---

## 📋 Checklist

- [ ] Backend задеплоен на Railway
- [ ] Получен URL backend API
- [ ] Обновлен `VITE_API_URL`
- [ ] Добавлены environment variables в Vercel
- [ ] Нажата кнопка Deploy

---

## 🌐 После деплоя

Ваш сайт будет доступен:
```
https://mm05.vercel.app
```

Проверьте:
- ✅ Главная страница
- ✅ Каталог (sidebar)
- ✅ Товары
- ✅ Корзина
- ✅ Авторизация

---

**Готово! 🎉**

Подробная инструкция: `VERCEL_DEPLOY_GUIDE.md`
