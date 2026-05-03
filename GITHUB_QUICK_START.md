# ⚡ Быстрая загрузка на GitHub

## 📦 Шаг 1: Создайте репозиторий

1. Откройте: https://github.com/new
2. Заполните:
   ```
   Repository name: mm05-furniture-store
   Private ✅
   ❌ НЕ добавляйте README
   ```
3. Нажмите **"Create repository"**

---

## 💻 Шаг 2: Загрузите код

### Вариант А: Через bat файл (Windows)

Просто запустите файл:
```
git-setup.bat
```

Затем выполните команды, которые он покажет.

### Вариант Б: Вручную

Откройте терминал и выполните:

```bash
# 1. Добавьте файлы
git add .

# 2. Создайте коммит
git commit -m "Initial commit: MM05 furniture store"

# 3. Переименуйте ветку
git branch -M main

# 4. Подключите GitHub (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git

# 5. Загрузите код
git push -u origin main
```

---

## 🔑 Если просит пароль

**НЕ используйте пароль от GitHub!**

Используйте **Personal Access Token**:

1. Откройте: https://github.com/settings/tokens
2. **"Generate new token (classic)"**
3. Выберите: `repo` (все галочки)
4. **"Generate token"**
5. **СКОПИРУЙТЕ токен**
6. Используйте его вместо пароля

---

## ✅ Проверка

Откройте ваш репозиторий на GitHub:
```
https://github.com/YOUR_USERNAME/mm05-furniture-store
```

Должны быть видны все файлы проекта.

---

## 🚀 Следующий шаг: Vercel

1. Откройте: https://vercel.com/
2. **"Add New Project"**
3. **"Import Git Repository"**
4. Выберите `mm05-furniture-store`
5. Настройте:
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
6. Добавьте Environment Variables (см. QUICK_DEPLOY.md)
7. **"Deploy"**

---

## 🎉 Готово!

Ваш сайт будет доступен на:
```
https://mm05.vercel.app
```

---

**Подробная инструкция**: `GITHUB_SETUP.md`
