# 🚀 Деплой MM05 на Vercel - Пошаговая инструкция

## 📖 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Подробная инструкция](#подробная-инструкция)
3. [Решение проблем](#решение-проблем)

---

## Быстрый старт

### Шаг 1: Подготовьте Git репозиторий

**Запустите скрипт:**
```bash
setup-github.bat
```

Или выполните вручную:
```bash
git init
git add .
git commit -m "Initial commit: MM05 furniture store"
git branch -M main
```

---

### Шаг 2: Создайте GitHub репозиторий

1. Откройте: **https://github.com/new**
2. Название: `mm05-furniture-store`
3. Видимость: **Private** ✅
4. **НЕ добавляйте** README, .gitignore, License
5. Нажмите **"Create repository"**

---

### Шаг 3: Загрузите код на GitHub

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
git push -u origin main
```

**Если попросит пароль:**
- Используйте **Personal Access Token** (не пароль!)
- Создать токен: https://github.com/settings/tokens
- Выберите scope: `repo` (все галочки)

---

### Шаг 4: Импортируйте в Vercel

1. Откройте: **https://vercel.com/new**
2. Войдите через GitHub
3. Найдите `mm05-furniture-store`
4. Нажмите **"Import"**

---

### Шаг 5: Настройте проект

**Framework Preset:** Vite

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3FubHN3bHRkcXFqbWZvZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzI2MDQsImV4cCI6MjA5MjgwODYwNH0.TUOsZEh81FG_QscwJ_WcwiWRD88nWtDAuJ1U_dKr8Lg
VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu
VITE_API_URL=https://your-backend.railway.app/api
```

⚠️ **ВАЖНО:** Замените `VITE_API_URL` на ваш реальный backend URL!

---

### Шаг 6: Деплой

Нажмите **"Deploy"** 🚀

Дождитесь завершения (2-3 минуты)

---

### Шаг 7: Готово! 🎉

Ваш сайт доступен по адресу:
```
https://mm05-furniture-store.vercel.app
```

---

## Подробная инструкция

### 📚 Доступные документы

| Документ | Для кого |
|----------|----------|
| **START_PRODUCTION.md** | Обзор всех инструкций |
| **VERCEL_QUICK_IMPORT.md** | Быстрый старт (5 минут) |
| **VERCEL_IMPORT_GUIDE.md** | Подробная инструкция |
| **VERCEL_VISUAL_GUIDE.md** | С описанием экранов |
| **DEPLOYMENT_CHECKLIST.md** | Полный чеклист |

### 🛠️ Инструменты

- **setup-github.bat** - автоматизация Git setup
- **vercel.json** - конфигурация Vercel
- **.vercelignore** - исключения из деплоя

---

## Решение проблем

### ❌ Git не установлен

**Симптомы:**
```
'git' is not recognized as an internal or external command
```

**Решение:**
1. Скачайте Git: https://git-scm.com/download/win
2. Установите с настройками по умолчанию
3. Перезапустите терминал

---

### ❌ Ошибка при git push

**Симптомы:**
```
remote: Support for password authentication was removed
```

**Решение:**
1. Откройте: https://github.com/settings/tokens
2. Нажмите: **"Generate new token (classic)"**
3. Note: "Vercel deployment"
4. Expiration: 90 days
5. Scopes: ✅ `repo` (все галочки)
6. Нажмите: **"Generate token"**
7. **СКОПИРУЙТЕ ТОКЕН**
8. Используйте токен вместо пароля при `git push`

---

### ❌ Backend не отвечает

**Симптомы:**
- Товары не загружаются
- Ошибки в консоли: `Failed to fetch`
- Network errors

**Решение:**
1. Убедитесь, что backend задеплоен на Railway
2. Проверьте `VITE_API_URL` в Vercel Dashboard
3. Откройте: Vercel Dashboard → Settings → Environment Variables
4. Обновите `VITE_API_URL` на правильный URL
5. Redeploy: Deployments → Latest → ⋯ → Redeploy

---

### ❌ Vercel build failed

**Симптомы:**
```
Error: Build failed
```

**Решение:**
1. Откройте логи в Vercel Dashboard
2. Проверьте, что все environment variables добавлены
3. Убедитесь, что `vercel.json` существует
4. Попробуйте локальный build:
   ```bash
   npm run build
   ```
5. Если локально работает - проверьте environment variables в Vercel

---

### ❌ Supabase не работает

**Симптомы:**
- Авторизация не работает
- Ошибки: `Invalid API key`

**Решение:**
1. Проверьте переменные в Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
2. Убедитесь, что Supabase проект активен
3. Проверьте API ключи в Supabase Dashboard

---

### ❌ Страница 404 при переходе

**Симптомы:**
- Главная страница работает
- При переходе на `/catalog` - 404

**Решение:**
1. Проверьте `vercel.json` - должны быть rewrites:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. Если файл есть - redeploy проект

---

### ❌ Каталог sidebar не работает

**Симптомы:**
- Кнопка "Каталог" не открывает sidebar
- Ошибка в консоли

**Решение:**
1. Откройте консоль браузера (F12)
2. Проверьте ошибки
3. Убедитесь, что `CatalogSidebar` добавлен в `App.tsx`
4. Проверьте, что `use-catalog.ts` hook работает

---

## 🔄 Автоматические деплои

После первого деплоя, каждый `git push` автоматически деплоит новую версию:

```bash
# 1. Внесите изменения
# 2. Закоммитьте
git add .
git commit -m "Update: описание изменений"

# 3. Загрузите на GitHub
git push

# 4. Vercel автоматически задеплоит
```

**Отслеживание:**
- Vercel Dashboard → Deployments
- Статус: Building → Ready
- Время: ~2-3 минуты

---

## ✅ Проверка после деплоя

### Основные функции

- [ ] Главная страница загружается
- [ ] Navbar отображается
- [ ] Кнопка "Каталог" работает
- [ ] Каталог sidebar открывается слева
- [ ] Поиск работает
- [ ] Фильтры работают
- [ ] Товары добавляются в корзину
- [ ] Корзина работает
- [ ] Авторизация работает
- [ ] Оплата работает

### Производительность

- [ ] Lighthouse Score > 90
- [ ] Страница загружается < 3 секунд
- [ ] Анимации плавные (60 FPS)
- [ ] Изображения оптимизированы

### Мобильная версия

- [ ] Сайт адаптивный
- [ ] Меню работает
- [ ] Sidebar fullscreen
- [ ] Touch события работают

---

## 📊 Мониторинг

### Vercel Dashboard

**Что смотреть:**
- 📈 Analytics - посещения
- ⚡ Performance - скорость
- 🐛 Errors - ошибки
- 🌍 Geography - география пользователей

**Где найти:**
https://vercel.com/dashboard

### Stripe Dashboard

**Что смотреть:**
- 💳 Payments - платежи
- 📊 Revenue - доход
- 🔔 Webhooks - события

**Где найти:**
https://dashboard.stripe.com

### Supabase Dashboard

**Что смотреть:**
- 🗄️ Database - база данных
- 👤 Auth - пользователи
- 📊 API - запросы

**Где найти:**
https://supabase.com/dashboard

---

## 🎯 Следующие шаги

### После успешного деплоя

1. **Custom Domain (опционально)**
   - Купите домен
   - Настройте DNS
   - Добавьте в Vercel

2. **SEO оптимизация**
   - Добавьте meta tags
   - Настройте sitemap
   - Добавьте robots.txt

3. **Аналитика**
   - Google Analytics
   - Yandex Metrika
   - Vercel Analytics

4. **Мониторинг**
   - Sentry для ошибок
   - LogRocket для сессий
   - Hotjar для heatmaps

5. **Маркетинг**
   - Объявите о запуске
   - Соберите feedback
   - Итерируйте

---

## 📞 Поддержка

### Документация

- **Vercel:** https://vercel.com/docs
- **GitHub:** https://docs.github.com
- **Vite:** https://vitejs.dev
- **React:** https://react.dev

### Помощь

- 💬 Напишите в чат
- 📧 Email поддержка
- 📚 Проверьте документацию

---

## 🎉 Поздравляем!

Ваш магазин MM05 теперь в production!

**Ваши ссылки:**
- 🌐 Сайт: `https://mm05-furniture-store.vercel.app`
- 📊 Dashboard: https://vercel.com/dashboard
- 🐙 GitHub: `https://github.com/YOUR_USERNAME/mm05-furniture-store`

---

**Удачи с запуском! 🚀**

*Если возникнут вопросы - всегда готовы помочь!*
