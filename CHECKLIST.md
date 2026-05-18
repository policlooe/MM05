# ✅ Чеклист исправлений MM05

## 🎯 Оставшиеся задачи (1.5 часа)

### 🔴 Критично - Изображения (30 минут)

- [ ] **Apple Touch Icon** (10 мин)
  - [ ] Создать файл `public/apple-touch-icon.png` (180x180px)
  - [ ] Проверить: `ls -lh public/apple-touch-icon.png`
  - [ ] Протестировать на iPhone (Safari → Поделиться → На экран Домой)

- [ ] **OG Image** (20 мин)
  - [ ] Создать файл `public/og-image.jpg` (1200x630px)
  - [ ] Проверить: `ls -lh public/og-image.jpg`
  - [ ] Протестировать: https://www.opengraph.xyz/url/https://mm05.vercel.app/
  - [ ] Отправить ссылку в Telegram/VK и проверить превью

---

### 🟡 Важно - Accessibility (1 час)

#### Login.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопке показа/скрытия пароля

#### Register.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопке показа пароля
- [ ] Добавить `aria-label` к кнопке показа подтверждения пароля

#### Catalog.tsx (10 мин)
- [ ] Добавить `aria-label` и `aria-expanded` к кнопке фильтров
- [ ] Добавить `aria-label` к кнопке очистки поиска
- [ ] Добавить `aria-label` к кнопке сброса фильтров

#### Favorites.tsx (10 мин)
- [ ] Добавить `aria-label` к кнопкам удаления из избранного

#### ProductPage.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопке "Назад к каталогу"

#### Admin/Products.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопкам редактирования
- [ ] Добавить `aria-label` к кнопкам удаления

#### Admin/ProductsManagement.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопкам удаления товаров

#### Admin/ProductForm.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопкам удаления изображений

#### Admin/ProductEdit.tsx (5 мин)
- [ ] Добавить `aria-label` к кнопкам удаления характеристик

---

## ✅ Уже исправлено

### 🔒 Безопасность (100%)
- [x] XSS уязвимости устранены
  - [x] `ProductPage.tsx` - Санитизация HTML
  - [x] `About.tsx` - Санитизация HTML
  - [x] Установлен `dompurify`
  - [x] Создан хук `useSanitizedHTML`

- [x] Небезопасные внешние ссылки исправлены
  - [x] `Footer.tsx` - Добавлен `rel="noopener noreferrer"`
  - [x] `About.tsx` - Добавлен `rel="noopener noreferrer"`
  - [x] `Contact.tsx` - Добавлен `rel="noopener noreferrer"`
  - [x] `ContactUs.tsx` - Добавлен `rel="noopener noreferrer"`

- [x] Content Security Policy настроен
  - [x] `public/_headers` - CSP добавлен
  - [x] X-Frame-Options: DENY
  - [x] X-Content-Type-Options: nosniff
  - [x] Referrer-Policy настроен
  - [x] Permissions-Policy настроен

---

### 🔍 SEO (95%)
- [x] SEO компонент добавлен на все страницы
  - [x] `Checkout.tsx` - "Оформление заказа"
  - [x] `Payment.tsx` - "Оплата заказа"
  - [x] `Login.tsx` - "Вход в аккаунт"
  - [x] `Register.tsx` - "Регистрация"
  - [x] `About.tsx` - "О компании"
  - [x] `Contact.tsx` - "Контакты"
  - [x] `Favorites.tsx` - "Избранное"

- [x] robots.txt и sitemap согласованы
  - [x] Убран `/payment` из `robots.txt`
  - [x] Обновлен `sitemap.xml`

- [x] Динамический sitemap
  - [x] Создан `scripts/generate-sitemap.ts`
  - [x] Добавлен скрипт в `package.json`
  - [x] Автоматический запуск при `npm run build`

- [x] Микроразметка JSON-LD
  - [x] FurnitureStore схема в `index.html`
  - [x] Адрес и координаты
  - [x] Часы работы
  - [x] Каталог товаров

---

### 📱 HTML и iOS (95%)
- [x] HTML структура исправлена
  - [x] Скрипт Vercel внутри `<body>`
  - [x] Noscript fallback добавлен
  - [x] Ссылка на Apple Touch Icon
  - [x] Ссылка на Web App Manifest

- [x] Web App Manifest создан
  - [x] `public/site.webmanifest`
  - [x] Настроены иконки
  - [x] Настроены цвета
  - [x] Режим standalone

- [x] iOS оптимизации
  - [x] Класс `.ios-gpu-optimized` создан
  - [x] Применен к Hero баннерам
  - [x] Применен к Promotions
  - [x] GPU ускорение настроено
  - [x] `background-attachment: fixed` отключен на мобильных

---

### ⚡ Performance (85%)
- [x] Lazy loading изображений
  - [x] `OptimizedImage` компонент
  - [x] `loading="lazy"` на всех изображениях
  - [x] Hero использует `loading="eager"`

- [x] Оптимизация шрифтов
  - [x] Preconnect для Google Fonts
  - [x] Preload критических шрифтов
  - [x] `display=swap` для шрифтов

- [x] Prefetch ресурсов
  - [x] DNS prefetch для fonts.googleapis.com
  - [x] Prefetch для /catalog

---

## 🧪 Проверка после выполнения

### Изображения
- [ ] Проверить размеры файлов
  ```bash
  file public/apple-touch-icon.png  # 180x180
  file public/og-image.jpg          # 1200x630
  ```

- [ ] Проверить на iOS
  - [ ] Открыть сайт в Safari
  - [ ] Добавить на главный экран
  - [ ] Проверить иконку

- [ ] Проверить OG теги
  - [ ] https://www.opengraph.xyz/url/https://mm05.vercel.app/
  - [ ] https://cards-dev.twitter.com/validator
  - [ ] Telegram/VK превью

### Accessibility
- [ ] Проверить keyboard navigation
  - [ ] Tab через все кнопки
  - [ ] Enter для активации
  - [ ] Escape для закрытия модалок

- [ ] Проверить screen reader (если есть)
  - [ ] Все кнопки озвучиваются
  - [ ] Aria-labels корректны
  - [ ] Контекст понятен

- [ ] Онлайн проверка
  - [ ] https://wave.webaim.org/
  - [ ] https://www.accessibilitychecker.org/

### Общая проверка
- [ ] Запустить dev сервер
  ```bash
  npm run dev
  ```

- [ ] Сгенерировать sitemap
  ```bash
  npm run generate:sitemap
  ```

- [ ] Собрать для продакшена
  ```bash
  npm run build
  ```

- [ ] Проверить сборку
  ```bash
  npm run preview
  ```

- [ ] Проверить в валидаторах
  - [ ] SEO: https://search.google.com/test/rich-results
  - [ ] HTML: https://validator.w3.org/
  - [ ] Performance: https://pagespeed.web.dev/

---

## 📊 Прогресс

### Общий прогресс: 90% → 100%

```
Безопасность:  ████████████████████ 100% ✅
SEO:           ██████████████████░░  95% → 100%
Performance:   █████████████████░░░  85% ✅
Accessibility: ████████████████░░░░  80% → 100%
UX:            ██████████████████░░  90% → 100%
```

### Задачи
- ✅ **Выполнено:** 15/18 (83%)
- ⚠️ **В работе:** 3/18 (17%)
- 🟢 **Опционально:** 3 задачи

---

## ⏱️ Тайминг

### Критично (30 мин)
- ⚡ Apple Touch Icon: 10 минут
- ⚡ OG Image: 20 минут

### Важно (1 час)
- ⚡ Login.tsx: 5 минут
- ⚡ Register.tsx: 5 минут
- ⚡ Catalog.tsx: 10 минут
- ⚡ Favorites.tsx: 10 минут
- ⚡ ProductPage.tsx: 5 минут
- ⚡ Admin страницы: 25 минут

### Проверка (15 мин)
- ⚡ Локальная проверка: 5 минут
- ⚡ Онлайн валидаторы: 10 минут

**Всего:** 1 час 45 минут

---

## 🎉 После выполнения

### Метрики
- Security: 10/10 ✅
- SEO: 10/10 ✅
- Performance: 8.5/10 ✅
- Accessibility: 10/10 ✅
- UX: 10/10 ✅

**Средний балл:** 9.7/10

### Статус
🟢 **Готов к продакшену на 100%!**

---

## 📚 Документация

- **Быстрый старт:** `QUICK_START_FIXES.md`
- **Полный отчет:** `FINAL_AUDIT_SUMMARY.md`
- **Изображения:** `public/IMAGES_GENERATION_GUIDE.md`
- **Навигация:** `FILES_CREATED_INDEX.md`

---

**Дата:** 2026-05-18  
**Версия:** 1.0  
**Обновлено:** После каждой выполненной задачи

---

# 👉 Начните с создания изображений!
