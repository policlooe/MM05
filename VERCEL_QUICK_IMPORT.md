# ⚡ Быстрый импорт в Vercel

## 🎯 За 5 минут

### 1️⃣ Запустите скрипт (Windows)

```bash
setup-github.bat
```

Скрипт автоматически:
- ✅ Инициализирует git
- ✅ Добавит все файлы
- ✅ Создаст коммит
- ✅ Переименует ветку в main

---

### 2️⃣ Создайте GitHub репозиторий

**Откройте:** https://github.com/new

**Настройки:**
- Repository name: `mm05-furniture-store`
- Private ✅
- ❌ НЕ добавляйте README, .gitignore, License

**Нажмите:** "Create repository"

---

### 3️⃣ Загрузите код на GitHub

Скопируйте команды с GitHub (замените YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
git push -u origin main
```

**Если попросит пароль:**
- Username: ваш GitHub username
- Password: используйте **Personal Access Token** (не пароль!)

**Создать токен:** https://github.com/settings/tokens
- Выберите: `repo` (все галочки)
- Скопируйте токен и используйте вместо пароля

---

### 4️⃣ Импортируйте в Vercel

**Откройте:** https://vercel.com/new

1. **Import Git Repository**
2. Выберите `mm05-furniture-store`
3. **Configure Project:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3FubHN3bHRkcXFqbWZvZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzI2MDQsImV4cCI6MjA5MjgwODYwNH0.TUOsZEh81FG_QscwJ_WcwiWRD88nWtDAuJ1U_dKr8Lg
   VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu
   VITE_API_URL=https://your-backend.railway.app/api
   ```
   
   ⚠️ **Замените** `VITE_API_URL` на ваш backend URL!

5. **Нажмите:** "Deploy" 🚀

---

### 5️⃣ Готово! 🎉

Через 2-3 минуты ваш сайт будет доступен:
```
https://mm05-furniture-store.vercel.app
```

---

## 🔧 Если нужна помощь

### Git не установлен
Скачайте: https://git-scm.com/download/win

### Ошибка при push
Используйте Personal Access Token вместо пароля:
https://github.com/settings/tokens

### Backend не работает
1. Задеплойте backend на Railway
2. Обновите `VITE_API_URL` в Vercel
3. Перезапустите деплой в Vercel

---

## 📚 Подробные инструкции

- **Полная инструкция:** `VERCEL_IMPORT_GUIDE.md`
- **GitHub setup:** `GITHUB_QUICK_START.md`
- **Vercel deploy:** `QUICK_DEPLOY.md`

---

**Нужна помощь?** Пишите в чат! 💬
