# 📸 Визуальная инструкция: Импорт в Vercel

## 🎬 Пошаговая инструкция с описанием экранов

---

## Часть 1: Подготовка Git репозитория

### Шаг 1: Запустите setup-github.bat

**Что делать:**
- Двойной клик на файл `setup-github.bat`

**Что увидите:**
```
========================================
  🚀 GitHub Setup для MM05
========================================

✅ Git найден
📦 Инициализация Git репозитория...
✅ Репозиторий инициализирован
📁 Добавление файлов...
✅ Файлы добавлены
💾 Создание коммита...
✅ Коммит создан
🔄 Переименование ветки в main...
✅ Ветка переименована

========================================
  ✅ Git репозиторий готов!
========================================
```

**Результат:** Git репозиторий готов к загрузке на GitHub

---

## Часть 2: Создание GitHub репозитория

### Шаг 2: Откройте GitHub

**URL:** https://github.com/new

**Что увидите:**
- Страница "Create a new repository"

### Шаг 3: Заполните форму

**Заполните поля:**

1. **Repository name:**
   ```
   mm05-furniture-store
   ```

2. **Description (опционально):**
   ```
   Premium furniture e-commerce store with Stripe integration
   ```

3. **Visibility:**
   - ✅ **Private** (рекомендуется)
   - или **Public**

4. **Initialize this repository:**
   - ❌ **НЕ ставьте галочки!**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

### Шаг 4: Создайте репозиторий

**Что делать:**
- Нажмите зеленую кнопку **"Create repository"**

**Что увидите:**
- Страница с командами для загрузки кода
- Заголовок: "Quick setup — if you've done this kind of thing before"

---

## Часть 3: Загрузка кода на GitHub

### Шаг 5: Скопируйте команды

**На странице GitHub найдите раздел:**
```
…or push an existing repository from the command line
```

**Команды будут выглядеть так:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
git branch -M main
git push -u origin main
```

### Шаг 6: Выполните команды

**Откройте терминал** в корне проекта (Git Bash, PowerShell, или CMD)

**Выполните команды:**
```bash
# Подключите GitHub репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git

# Загрузите код
git push -u origin main
```

**Что увидите:**
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 1.5 MiB | 2.0 MiB/s, done.
Total 150 (delta 45), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/mm05-furniture-store.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 🔑 Если попросит авторизацию

**Что увидите:**
```
Username for 'https://github.com':
Password for 'https://YOUR_USERNAME@github.com':
```

**Что вводить:**
- **Username:** ваш GitHub username
- **Password:** **НЕ пароль!** Используйте Personal Access Token

**Создание токена:**
1. Откройте: https://github.com/settings/tokens
2. Нажмите: **"Generate new token (classic)"**
3. **Note:** "Vercel deployment"
4. **Expiration:** 90 days
5. **Select scopes:** ✅ `repo` (все галочки)
6. Нажмите: **"Generate token"**
7. **СКОПИРУЙТЕ ТОКЕН** (зеленый текст)
8. Вставьте токен вместо пароля

---

## Часть 4: Импорт в Vercel

### Шаг 7: Откройте Vercel

**URL:** https://vercel.com/

**Что делать:**
- Войдите через GitHub аккаунт (если еще не вошли)

### Шаг 8: Создайте новый проект

**Что увидите:**
- Dashboard с кнопкой **"Add New..."**

**Что делать:**
1. Нажмите **"Add New..."**
2. Выберите **"Project"**

### Шаг 9: Импортируйте репозиторий

**Что увидите:**
- Страница "Import Git Repository"
- Список ваших GitHub репозиториев

**Что делать:**
1. Найдите `mm05-furniture-store`
2. Нажмите **"Import"** справа от названия

### Шаг 10: Настройте проект

**Что увидите:**
- Страница "Configure Project"

**Заполните поля:**

1. **Framework Preset:**
   - Выберите: **Vite**

2. **Root Directory:**
   - Оставьте: `./`

3. **Build and Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Шаг 11: Добавьте Environment Variables

**Что делать:**
1. Раскройте секцию **"Environment Variables"**
2. Нажмите **"Add"** для каждой переменной

**Добавьте переменные:**

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://anwqnlswltdqqjmfogvu.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_PROJECT_ID` | `anwqnlswltdqqjmfogvu` |
| `VITE_API_URL` | `https://your-backend.railway.app/api` |

⚠️ **ВАЖНО:** Замените `VITE_API_URL` на реальный URL вашего backend!

### Шаг 12: Запустите деплой

**Что делать:**
- Нажмите синюю кнопку **"Deploy"** внизу страницы

**Что увидите:**
- Страница с логами деплоя
- Анимация загрузки
- Логи установки зависимостей и сборки

**Процесс займет 2-3 минуты:**
```
Installing dependencies...
✓ Dependencies installed
Building...
✓ Build completed
Deploying...
✓ Deployment ready
```

---

## Часть 5: Проверка деплоя

### Шаг 13: Откройте сайт

**Что увидите:**
- Страница успешного деплоя
- Кнопка **"Visit"**
- URL вида: `https://mm05-furniture-store.vercel.app`

**Что делать:**
- Нажмите **"Visit"** или скопируйте URL

### Шаг 14: Проверьте функциональность

**Проверьте на сайте:**

✅ **Главная страница:**
- Hero секция загружается
- Товары отображаются
- Анимации работают

✅ **Navbar:**
- Кнопка "Каталог" работает
- Корзина открывается
- Номер телефона виден

✅ **Каталог Sidebar:**
- Открывается слева
- Поиск работает
- Фильтры работают
- Товары добавляются в корзину

✅ **Авторизация:**
- Форма входа работает
- Регистрация работает
- Supabase подключен

✅ **Корзина:**
- Товары отображаются
- Количество меняется
- Итоговая сумма считается

✅ **Оплата:**
- Переход на Stripe работает
- Backend API отвечает

---

## 🎉 Готово!

Ваш магазин MM05 в production!

**Ваши ссылки:**
- 🌐 **Сайт:** `https://mm05-furniture-store.vercel.app`
- 📊 **Dashboard:** https://vercel.com/dashboard
- 📝 **Deployments:** https://vercel.com/dashboard/deployments

---

## 🔄 Автоматические обновления

После первого деплоя, каждый `git push` будет автоматически деплоить новую версию:

```bash
# Внесите изменения
git add .
git commit -m "Update: описание изменений"
git push

# Vercel автоматически задеплоит
```

**Что увидите в Vercel:**
- Новый деплой появится в списке
- Статус: Building → Ready
- Автоматическое обновление production URL

---

## 🐛 Troubleshooting

### Проблема: Backend не отвечает

**Симптомы:**
- Товары не загружаются
- Авторизация не работает
- Ошибки в консоли браузера

**Решение:**
1. Проверьте `VITE_API_URL` в Vercel Dashboard
2. Убедитесь, что backend задеплоен на Railway
3. Проверьте CORS в backend
4. Перезапустите деплой в Vercel

### Проблема: Supabase не работает

**Симптомы:**
- Авторизация не работает
- Ошибки "Invalid API key"

**Решение:**
1. Проверьте переменные Supabase в Vercel
2. Убедитесь, что Supabase проект активен
3. Проверьте API ключи в Supabase Dashboard

### Проблема: Страница 404

**Симптомы:**
- При переходе на `/catalog` или другие страницы - 404

**Решение:**
- Проверьте `vercel.json` - должны быть rewrites
- Перезапустите деплой

---

## 📚 Дополнительные ресурсы

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Docs:** https://docs.github.com
- **Vite Docs:** https://vitejs.dev

---

**Нужна помощь?** Пишите в чат! 💬
