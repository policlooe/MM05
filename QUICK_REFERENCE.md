# 📋 Быстрая справка - Деплой MM05

## 🚀 Команды Git

```bash
# Инициализация
git init
git add .
git commit -m "Initial commit: MM05 furniture store"
git branch -M main

# Подключение GitHub (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
git push -u origin main

# Обновление
git add .
git commit -m "Update: описание"
git push
```

---

## 🔗 Важные ссылки

| Сервис | URL |
|--------|-----|
| **GitHub новый repo** | https://github.com/new |
| **GitHub токены** | https://github.com/settings/tokens |
| **Vercel новый проект** | https://vercel.com/new |
| **Vercel dashboard** | https://vercel.com/dashboard |
| **Stripe dashboard** | https://dashboard.stripe.com |
| **Supabase dashboard** | https://supabase.com/dashboard |

---

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=https://anwqnlswltdqqjmfogvu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3FubHN3bHRkcXFqbWZvZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzI2MDQsImV4cCI6MjA5MjgwODYwNH0.TUOsZEh81FG_QscwJ_WcwiWRD88nWtDAuJ1U_dKr8Lg
VITE_SUPABASE_PROJECT_ID=anwqnlswltdqqjmfogvu
VITE_API_URL=https://your-backend.railway.app/api
```

⚠️ Замените `VITE_API_URL`!

---

## ⚙️ Vercel настройки

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

## 🐛 Быстрые решения

### Git push ошибка
→ Используйте Personal Access Token вместо пароля
→ https://github.com/settings/tokens

### Backend не отвечает
→ Проверьте VITE_API_URL в Vercel
→ Убедитесь, что backend на Railway работает

### Build failed
→ Проверьте environment variables
→ Попробуйте `npm run build` локально

### 404 на страницах
→ Проверьте vercel.json rewrites
→ Redeploy проект

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| `START_PRODUCTION.md` | Главный обзор |
| `README_DEPLOY.md` | Полная инструкция |
| `VERCEL_QUICK_IMPORT.md` | Быстрый старт |
| `DEPLOYMENT_CHECKLIST.md` | Чеклист |
| `setup-github.bat` | Автоматизация |

---

## ✅ Чеклист

- [ ] Git репозиторий инициализирован
- [ ] GitHub репозиторий создан
- [ ] Код загружен на GitHub
- [ ] Vercel проект создан
- [ ] Environment variables добавлены
- [ ] Деплой успешен
- [ ] Сайт работает
- [ ] Функции протестированы

---

**Нужна помощь?** Откройте `START_PRODUCTION.md`
