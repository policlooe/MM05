# 🛋️ Мебельный магазин - MM05

Современный интернет-магазин мебели с полным функционалом e-commerce.

## 🚀 Быстрый старт

### Установка
```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Откроется на http://localhost:8082/

### Build для production
```bash
npm run build
npm run preview
```

---

## 📁 Структура проекта

```
mebel-project/
├── src/
│   ├── components/        # React компоненты
│   │   ├── ui/           # Базовые UI компоненты
│   │   ├── CartSidebar.tsx
│   │   ├── CatalogSidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── pages/            # Страницы приложения
│   │   ├── Index.tsx     # Главная
│   │   ├── Catalog.tsx   # Каталог
│   │   ├── ProductPage.tsx
│   │   ├── Checkout.tsx
│   │   └── ...
│   ├── store/            # Zustand stores
│   │   └── cart.tsx      # Корзина
│   ├── hooks/            # Custom hooks
│   │   ├── use-catalog.ts
│   │   └── useScrollLock.ts
│   ├── types/            # TypeScript типы
│   ├── data/             # Данные (товары)
│   └── lib/              # Утилиты
├── backend/              # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── prisma/
│   └── ...
└── ...
```

---

## 🎨 Основные компоненты

### Навигация
- **Navbar** - Верхняя навигация с поиском, корзиной, каталогом
- **MobileNav** - Нижняя навигация для мобильных
- **Footer** - Подвал с контактами и ссылками

### Корзина
- **CartSidebar** - Боковая панель корзины (справа)
- Автоматическое сохранение в localStorage
- Управление количеством товаров
- Расчет итоговой суммы

### Каталог
- **CatalogSidebar** - Боковая панель каталога (слева)
- Поиск по товарам
- Фильтры по категориям
- Сортировка по цене
- Фильтр по цене (slider)

### Товары
- **ProductPage** - Страница товара с конфигуратором
- **ProductConfiguratorV2** - Конфигуратор товара (цвет, размер, опции)
- **ProductReviews** - Отзывы о товаре
- **ReviewUploader** - Форма добавления отзыва

### UI компоненты
- **OptionButton** - Кнопка выбора варианта
- **OptionGroup** - Группа опций
- **ToggleOption** - Checkbox toggle
- **DeliveryOption** - Radio card доставки
- **PriceSummary** - Итоговая цена
- **OzonCard** - Базовая карточка

---

## 🔧 Технологии

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Build tool
- **React Router v6** - Роутинг
- **Zustand** - State management
- **TailwindCSS** - Стилизация
- **Framer Motion** - Анимации
- **React Query** - Кэширование данных
- **Sonner** - Уведомления

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - База данных
- **Stripe** - Платежи
- **Sentry** - Мониторинг ошибок

### UI библиотеки
- **shadcn/ui** - Компоненты
- **Lucide React** - Иконки
- **Radix UI** - Примитивы

---

## 📦 Основные функции

### ✅ Реализовано
- [x] Каталог товаров с фильтрами
- [x] Корзина с сохранением в localStorage
- [x] Конфигуратор товаров (цвет, размер, опции)
- [x] Страница товара с галереей
- [x] Отзывы с загрузкой фото
- [x] Форма заказа (checkout)
- [x] Интеграция Stripe для оплаты
- [x] Расчет доставки
- [x] Мобильная версия
- [x] Админ панель
- [x] Чат-лаунчер

### 🔄 В разработке
- [ ] Личный кабинет
- [ ] История заказов
- [ ] Избранное
- [ ] Сравнение товаров
- [ ] Email уведомления

---

## 🎯 Архитектура

### Управление состоянием

#### Глобальное (Zustand)
```typescript
// Корзина
const { items, total, add, remove, isOpen, open, close } = useCart();

// Каталог
const { isOpen, open, close } = useCatalog();
```

#### Локальное (useState)
```typescript
// Для форм, модальных окон, фильтров
const [isOpen, setIsOpen] = useState(false);
```

#### Props (контролируемые компоненты)
```typescript
// Для переиспользуемых UI компонентов
<OptionButton selected={true} onClick={...} />
```

### Паттерны компонентов

#### Автономные компоненты
Используют глобальное состояние, не требуют props:
```typescript
<CartSidebar />
<CatalogSidebar />
```

#### Контролируемые компоненты
Принимают props, полностью контролируются родителем:
```typescript
<ProductConfiguratorV2 
  basePrice={price}
  configuration={config}
  onConfigChange={handleChange}
/>
```

---

## 🧪 Тестирование

### Запуск тестов
```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage
npm run test:coverage
```

### Проверка типов
```bash
npx tsc --noEmit
```

### Линтинг
```bash
npm run lint
```

---

## 🚀 Деплой

### Frontend (Vercel)
```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel deploy --prod
```

### Backend (Railway/Render)
1. Создать проект на Railway/Render
2. Подключить GitHub репозиторий
3. Добавить environment переменные
4. Деплой автоматический при push

### Environment переменные

#### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Backend (.env)
```bash
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://yourdomain.com
SENTRY_DSN=https://...
```

---

## 📊 Производительность

### Bundle размеры
- **CSS**: 89.35 kB
- **React vendor**: 207.07 kB
- **Main vendor**: 309.08 kB
- **Total JS**: ~600 kB (gzipped ~180 kB)

### Оптимизации
- ✅ Lazy loading страниц
- ✅ Code splitting
- ✅ Image lazy loading
- ✅ React Query кэширование
- ✅ Мемоизация компонентов
- ✅ Debounce для поиска

---

## 🔐 Безопасность

### Frontend
- ✅ XSS защита (React автоматически)
- ✅ CSRF токены
- ✅ Валидация форм
- ✅ Sanitization пользовательского ввода

### Backend
- ✅ Helmet.js для HTTP заголовков
- ✅ Rate limiting
- ✅ CORS настройка
- ✅ Environment переменные
- ✅ Stripe webhook signature verification
- ✅ SQL injection защита (Prisma)

---

## 📝 Документация

### Основные документы
- `ПОЛНЫЙ_АУДИТ_ПРОЕКТА.md` - Полный аудит кодовой базы
- `DESIGN_SYSTEM.md` - Дизайн-система
- `FIGMA_COMPONENTS_GUIDE.md` - Гайд по Figma компонентам
- `START_PRODUCTION.md` - Гайд по запуску в production
- `БЫСТРЫЙ_СТАРТ.md` - Быстрый старт для разработчиков

### API документация
- Backend API: http://localhost:3000/api-docs (Swagger)
- Stripe webhooks: `/api/webhook`

---

## 🤝 Контрибьюция

### Как добавить новый компонент
1. Создать файл в `src/components/`
2. Добавить TypeScript типы
3. Экспортировать из `index.ts` (если UI компонент)
4. Добавить в Storybook (опционально)
5. Написать тесты (опционально)

### Как добавить новую страницу
1. Создать файл в `src/pages/`
2. Добавить роут в `src/App.tsx`
3. Добавить lazy loading
4. Добавить в навигацию (если нужно)

### Стиль кода
- Используйте TypeScript
- Следуйте ESLint правилам
- Используйте Prettier для форматирования
- Пишите понятные commit сообщения

---

## 📞 Поддержка

### Контакты
- **Email**: support@mm05.ru
- **Телефон**: +7 (928) 555-55-55
- **Адрес**: Дагестан, г. Махачкала, п. Шамхал

### Полезные ссылки
- [Документация React](https://react.dev)
- [Документация TypeScript](https://www.typescriptlang.org)
- [Документация Vite](https://vitejs.dev)
- [Документация Stripe](https://stripe.com/docs)

---

## 📄 Лицензия

MIT License - см. файл LICENSE

---

## 🎉 Благодарности

- **shadcn/ui** - за отличные UI компоненты
- **Vercel** - за хостинг и деплой
- **Stripe** - за платежную систему
- **Prisma** - за удобную ORM

---

**Сделано с ❤️ в России**
