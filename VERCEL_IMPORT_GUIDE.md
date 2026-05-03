# 🚀 Импорт GitHub репозитория в Vercel

## 📋 Пошаговая инструкция

### Шаг 1: Инициализация Git репозитория

Откройте терминал в корне проекта и выполните:

```bash
# Инициализируйте git репозиторий
git init

# Добавьте все файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit: MM05 furniture store"

# Переименуйте ветку в main
git branch -M main
```

---

### Шаг 2: Создайте репозиторий на GitHub

1. **Откройте:** https://github.com/new

2. **Заполните форму:**
   - **Repository name:** `mm05-furniture-store` (или любое другое имя)
   - **Description:** "Premium furniture e-commerce store with Stripe integration"
   - **Visibility:** 
     - ✅ **Private** (рекомендуется для коммерческого проекта)
     - или **Public** (если хотите открытый код)
   - **НЕ ДОБАВЛЯЙТЕ:**
     - ❌ README file
     - ❌ .gitignore
     - ❌ License

3. **Нажмите:** "Create repository"

---

### Шаг 3: Подключите GitHub репозиторий

GitHub покажет команды для загрузки кода. Выполните их:

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git

# Загрузите код на GitHub
git push -u origin main
```

**Если попросит авторизацию:**

- **Username:** ваш GitHub username
- **Password:** НЕ используйте пароль! Используйте **Personal Access Token**

---

### 🔑 Создание Personal Access Token (если нужно)

1. Откройте: https://github.com/settings/tokens
2. Нажмите: **"Generate new token (classic)"**
3. Заполните:
   - **Note:** "Vercel deployment"
   - **Expiration:** 90 days (или No expiration)
   - **Scopes:** выберите `repo` (все галочки в разделе repo)
4. Нажмите: **"Generate token"**
5. **СКОПИРУЙТЕ ТОКЕН** (он больше не появится!)
6. Используйте токен вместо пароля при `git push`

---

### Шаг 4: Импортируйте в Vercel

1. **Откройте:** https://vercel.com/

2. **Войдите** через GitHub аккаунт (если еще не вошли)

3. **Нажмите:** "Add New..." → "Project"

4. **Import Git Repository:**
   - Найдите ваш репозиторий `mm05-furniture-store`
   - Нажмите **"Import"**

5. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Environment Variables** - добавьте обязательные переменные:

   ```env
   VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3FubHN3bHRkcXFqbWZvZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzI2MDQsImV4cCI6MjA5MjgwODYwNH0.TUOsZEh81FG_QscwJ_WcwiWRD88nWtDAuJ1U_dKr8Lg
   VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

   **⚠️ ВАЖНО:** Замените `VITE_API_URL` на реальный URL вашего backend на Railway!

7. **Нажмите:** "Deploy" 🚀

---

### Шаг 5: Дождитесь деплоя

Vercel автоматически:
- ✅ Установит зависимости (`npm install`)
- ✅ Соберет проект (`npm run build`)
- ✅ Задеплоит на CDN
- ✅ Выдаст URL вида: `https://mm05-furniture-store.vercel.app`

Процесс займет 2-3 минуты.

---

## ✅ Проверка после деплоя

Откройте ваш сайт и проверьте:

- ✅ Главная страница загружается
- ✅ Navbar с кнопкой "Каталог"
- ✅ Каталог sidebar открывается слева
- ✅ Товары отображаются
- ✅ Корзина работает
- ✅ Авторизация работает (Supabase)
- ✅ Оплата работает (Stripe)

---

## 🔧 Если что-то не работает

### Backend не отвечает
- Проверьте `VITE_API_URL` в Vercel Environment Variables
- Убедитесь, что backend задеплоен на Railway
- Проверьте CORS настройки в backend

### Supabase не работает
- Проверьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`
- Убедитесь, что Supabase проект активен

### Stripe не работает
- Проверьте Stripe API ключи в backend
- Убедитесь, что webhook настроен на Railway URL

---

## 🔄 Автоматические деплои

После первого деплоя, Vercel будет автоматически деплоить при каждом `git push`:

```bash
# Внесите изменения в код
git add .
git commit -m "Update: описание изменений"
git push

# Vercel автоматически задеплоит новую версию
```

---

## 📊 Мониторинг

В Vercel Dashboard вы можете:
- 📈 Смотреть аналитику посещений
- 🐛 Отслеживать ошибки
- ⚡ Проверять скорость загрузки
- 🌍 Видеть географию пользователей

---

## 🎉 Готово!

Ваш магазин MM05 теперь в production!

**Ссылки:**
- 🌐 Сайт: `https://your-project.vercel.app`
- 📊 Dashboard: https://vercel.com/dashboard
- 📝 Логи: https://vercel.com/dashboard/deployments

---

## 💡 Полезные команды

```bash
# Проверить статус git
git status

# Посмотреть историю коммитов
git log --oneline

# Создать новую ветку для тестирования
git checkout -b feature/new-feature

# Вернуться на main
git checkout main

# Обновить код с GitHub
git pull origin main
```

---

**Нужна помощь?** Пишите в чат! 💬
