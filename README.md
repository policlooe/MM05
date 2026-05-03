# 🛋️ MM05 - Интернет-магазин мебели

Современный интернет-магазин мебели с Apple-inspired дизайном и зеленой цветовой схемой.

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd mebel-project
```

2. **Установите зависимости**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Настройте переменные окружения**

**Frontend** - создайте `.env.local`:
```env
VITE_API_URL="http://localhost:3000/api"
```

**Backend** - создайте `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mm05_db"
JWT_ACCESS_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-secret-here"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

💡 **Совет**: Используйте `node generate-secrets.js` для генерации безопасных секретов!

4. **Настройте базу данных**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run create-admin
cd ..
```

5. **Запустите проект**

В двух разных терминалах:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Сайт будет доступен на `http://localhost:5173`

## 📁 Структура проекта

```
mebel-project/
├── src/                      # Frontend исходники
│   ├── components/          # React компоненты
│   ├── pages/              # Страницы
│   ├── store/              # State management
│   ├── data/               # Данные товаров
│   └── lib/                # Утилиты
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Контроллеры
│   │   ├── services/       # Бизнес-логика
│   │   ├── middleware/     # Middleware
│   │   ├── routes/         # API роуты
│   │   └── validators/     # Валидация
│   └── prisma/             # Database схема
├── public/                  # Статические файлы
└── dist/                    # Production build
```

## 🎨 Технологии

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Build tool
- **TailwindCSS** - Стилизация
- **React Router** - Навигация
- **TanStack Query** - Управление данными
- **Zustand** - State management
- **Lucide React** - Иконки

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Типизация
- **Prisma** - ORM
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Bcrypt** - Хеширование паролей
- **Zod** - Валидация

## 🔐 Безопасность

- ✅ JWT токены с refresh механизмом
- ✅ Bcrypt для паролей (12 раундов)
- ✅ Prisma ORM (защита от SQL injection)
- ✅ Rate limiting на auth endpoints
- ✅ CORS настроен
- ✅ Helmet для безопасности
- ✅ Input validation с Zod
- ✅ Error boundary для React

## 📊 Производительность

- ✅ Bundle size: ~540 KB (180 KB gzipped)
- ✅ Code splitting по vendor чанкам
- ✅ React.memo для оптимизации
- ✅ Lazy loading изображений
- ✅ CSS code splitting
- ✅ Build time: ~2.85s

## 📱 Адаптивность

- ✅ Mobile-first дизайн
- ✅ Touch-friendly интерфейс (42×42px минимум)
- ✅ Адаптивная сетка (2→3→4 колонки)
- ✅ Горизонтальный скролл для фильтров
- ✅ Полноэкранная корзина на мобильных

## 🛠️ Доступные команды

### Frontend
```bash
npm run dev          # Запуск dev сервера
npm run build        # Production сборка
npm run preview      # Просмотр production сборки
npm run lint         # Проверка кода
```

### Backend
```bash
npm run dev          # Запуск dev сервера с hot reload
npm run build        # Компиляция TypeScript
npm start            # Запуск production сервера
npm run create-admin # Создание админа
```

### Утилиты
```bash
node generate-secrets.js  # Генерация безопасных секретов
```

## 📚 Документация

- [START_PRODUCTION.md](START_PRODUCTION.md) - Инструкция для production
- [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) - Отчет об оптимизации
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Чеклист для деплоя
- [FINAL_OPTIMIZATION_SUMMARY.md](FINAL_OPTIMIZATION_SUMMARY.md) - Итоговая сводка

## 🚀 Деплой

### Рекомендуемые платформы

**Frontend**: Vercel, Netlify, Cloudflare Pages  
**Backend**: Railway, Render, Heroku  
**Database**: Supabase, Neon, PlanetScale

Подробная инструкция в [START_PRODUCTION.md](START_PRODUCTION.md)

## 📞 Контакты

**MM05 (Мухаммад Мебель 05)**

- 📍 Адрес: Дагестан, г. Махачкала, п. Шамхал, ул. Сулеймана Стальского, 1
- 📱 Телефон: +7 928 833-15-32
- 💬 WhatsApp: +7 928 833-15-32
- 📧 Telegram: @mm05_mebel
- 🔗 VK: vk.com/mm05_mebel

## 📝 Лицензия

Proprietary - Все права защищены © 2026 MM05

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
2. Посмотрите [START_PRODUCTION.md](START_PRODUCTION.md)
3. Свяжитесь с технической поддержкой

---

**Сделано с ❤️ для MM05**
