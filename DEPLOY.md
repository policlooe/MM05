# 🚀 Инструкция по деплою

## Быстрый деплой на GitHub + Vercel

### 1. Подготовка

```bash
# Убедитесь, что все работает локально
npm install
npm run build

# Проверьте, что нет ошибок
npm run preview
```

### 2. Деплой на GitHub

```bash
# Инициализируйте git (если еще не сделали)
git init
git add .
git commit -m "Production ready: v1.0.0"

# Создайте репозиторий на GitHub
# Затем:
git remote add origin https://github.com/YOUR_USERNAME/mm05.git
git branch -M main
git push -u origin main
```

### 3. Деплой на Vercel

#### Вариант A: Через CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

#### Вариант B: Через веб-интерфейс
1. Зайдите на https://vercel.com/
2. Нажмите "New Project"
3. Импортируйте репозиторий с GitHub
4. Настройте переменные окружения:
   - `VITE_API_URL` - URL вашего backend
   - `VITE_GA_MEASUREMENT_ID` (опционально)
   - `VITE_SENTRY_DSN` (опционально)
5. Нажмите "Deploy"

### 4. Деплой Backend (Railway)

```bash
# Установите Railway CLI
npm i -g @railway/cli

# Войдите
railway login

# Инициализируйте проект
railway init

# Деплой
railway up
```

### 5. Настройка переменных окружения

В Railway добавьте:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
FRONTEND_URL=https://your-app.vercel.app
```

### 6. Проверка

- ✅ Frontend доступен по URL
- ✅ Backend отвечает на запросы
- ✅ База данных подключена
- ✅ Платежи работают (тестовый режим)
- ✅ Email уведомления отправляются

## 🔧 Troubleshooting

### Белый экран
```bash
# Очистите кэш и пересоберите
rm -rf node_modules dist .vite
npm install
npm run build
```

### Ошибки сборки
```bash
# Проверьте TypeScript
npm run build

# Проверьте зависимости
npm audit fix
```

### Backend не запускается
```bash
# Проверьте DATABASE_URL
cd backend
npx prisma db push
npm run dev
```

## 📊 После деплоя

1. Настройте мониторинг (см. `MONITORING_SETUP_GUIDE.md`)
2. Проверьте автобэкапы в GitHub Actions
3. Настройте домен (опционально)
4. Добавьте SSL сертификат (автоматически в Vercel)

---

**Время деплоя:** ~10 минут  
**Сложность:** Легко
