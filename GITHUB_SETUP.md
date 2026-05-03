# 📦 Загрузка проекта на GitHub

## 🎯 Пошаговая инструкция

### Шаг 1: Создайте репозиторий на GitHub

1. Откройте https://github.com/
2. Нажмите **"+"** в правом верхнем углу
3. Выберите **"New repository"**
4. Заполните:
   ```
   Repository name: mm05-furniture-store
   Description: Интернет-магазин мебели MM05
   Visibility: Private (или Public)
   ❌ НЕ добавляйте README, .gitignore, license
   ```
5. Нажмите **"Create repository"**

---

### Шаг 2: Подготовьте локальный проект

Откройте терминал в папке проекта и выполните:

```bash
# 1. Проверьте статус git
git status

# 2. Добавьте все файлы
git add .

# 3. Создайте коммит
git commit -m "Initial commit: MM05 furniture store with Stripe integration"

# 4. Переименуйте ветку в main (если нужно)
git branch -M main
```

---

### Шаг 3: Подключите GitHub репозиторий

**Замените `YOUR_USERNAME` на ваш GitHub username:**

```bash
# Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git

# Или если уже есть remote, обновите его:
git remote set-url origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
```

---

### Шаг 4: Загрузите код на GitHub

```bash
# Загрузите код
git push -u origin main
```

**Если попросит авторизацию:**
- Username: ваш GitHub username
- Password: используйте **Personal Access Token** (не пароль!)

---

### Шаг 5: Создайте Personal Access Token (если нужно)

Если Git просит пароль:

1. Откройте https://github.com/settings/tokens
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. Заполните:
   ```
   Note: Vercel Deploy Token
   Expiration: 90 days (или больше)
   Scopes: ✅ repo (все подпункты)
   ```
4. Нажмите **"Generate token"**
5. **СКОПИРУЙТЕ токен** (он больше не покажется!)
6. Используйте токен вместо пароля при `git push`

---

### Шаг 6: Проверьте загрузку

1. Откройте ваш репозиторий на GitHub
2. Убедитесь, что все файлы загружены
3. Проверьте, что есть:
   - ✅ `src/` - исходный код
   - ✅ `package.json` - зависимости
   - ✅ `vercel.json` - конфигурация Vercel
   - ✅ `.env.production` - production переменные

---

## 🚀 Теперь можно деплоить на Vercel!

### Вариант 1: Через Vercel Dashboard

1. Откройте https://vercel.com/
2. Нажмите **"Add New Project"**
3. Нажмите **"Import Git Repository"**
4. Выберите ваш репозиторий `mm05-furniture-store`
5. Настройте и деплойте!

### Вариант 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите
vercel login

# Деплой
vercel --prod
```

---

## 🔧 Команды Git (шпаргалка)

### Проверить статус
```bash
git status
```

### Добавить файлы
```bash
# Все файлы
git add .

# Конкретный файл
git add src/App.tsx
```

### Создать коммит
```bash
git commit -m "Описание изменений"
```

### Загрузить на GitHub
```bash
git push
```

### Обновить с GitHub
```bash
git pull
```

### Посмотреть историю
```bash
git log --oneline
```

---

## 🐛 Troubleshooting

### Ошибка: "remote origin already exists"
```bash
# Удалите старый remote
git remote remove origin

# Добавьте новый
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
```

### Ошибка: "failed to push some refs"
```bash
# Сначала получите изменения с GitHub
git pull origin main --rebase

# Затем загрузите
git push origin main
```

### Ошибка: "Authentication failed"
- Используйте **Personal Access Token** вместо пароля
- Или настройте SSH ключи

---

## 📋 Checklist

- [ ] Создан репозиторий на GitHub
- [ ] Выполнен `git add .`
- [ ] Выполнен `git commit -m "..."`
- [ ] Добавлен remote origin
- [ ] Выполнен `git push -u origin main`
- [ ] Код виден на GitHub
- [ ] Готов к деплою на Vercel

---

## 🎉 Готово!

Теперь ваш код на GitHub и готов к деплою на Vercel!

**Следующий шаг**: Импортируйте репозиторий в Vercel
