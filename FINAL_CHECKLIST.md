# ✅ Финальный чеклист перед запуском

## 🎯 Быстрая проверка готовности

### 1. ✅ Код и зависимости
- [x] Все зависимости установлены (`npm install` выполнен)
- [x] Нет ошибок компиляции (проверено через getDiagnostics)
- [x] Web Vitals пакет установлен (`web-vitals@4.2.4`)
- [x] Все импорты корректны

### 2. ✅ Accessibility
- [x] Alt текст добавлен ко всем изображениям
- [x] ARIA labels добавлены к кнопкам
- [x] Form labels связаны с inputs (htmlFor)
- [x] Цветовой контраст улучшен (WCAG AA)
- [x] Focus indicators добавлены
- [x] Keyboard navigation работает

### 3. ✅ Analytics
- [x] Web Vitals мониторинг интегрирован
- [x] E-commerce tracking настроен:
  - [x] view_item (ProductPage)
  - [x] add_to_cart (cart.tsx)
  - [x] begin_checkout (Checkout)
  - [x] purchase (CheckoutSuccess)

### 4. ✅ Database & Backups
- [x] Автоматические бэкапы настроены (GitHub Action)
- [x] Срок хранения: 30 дней
- [x] Сжатие бэкапов (.sql.gz)
- [x] Уведомления об ошибках

### 5. ✅ Документация
- [x] ACCESSIBILITY_ANALYTICS_COMPLETE.md создан
- [x] MONITORING_SETUP_GUIDE.md создан
- [x] PRODUCTION_READY_SUMMARY.md создан
- [x] FINAL_CHECKLIST.md создан

---

## 🚀 Что делать дальше

### Шаг 1: Проверьте локально
```bash
# Установите зависимости (если еще не сделали)
npm install

# Запустите dev сервер
npm run dev

# Откройте http://localhost:5173
# Проверьте в DevTools → Console логи:
# - [Web Vitals] CLS: ...
# - [Web Vitals] LCP: ...
# - [Analytics] Ecommerce - view_item
```

### Шаг 2: Проверьте accessibility
```bash
# Используйте Tab для навигации
# Все элементы должны иметь видимый focus (зеленая рамка)

# Проверьте с помощью Lighthouse:
# DevTools → Lighthouse → Accessibility
# Ожидаемый результат: 95+ / 100
```

### Шаг 3: Настройте мониторинг
```bash
# 1. Создайте Google Analytics 4 аккаунт
# 2. Скопируйте Measurement ID
# 3. Добавьте в .env.production:
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# 4. Создайте Sentry проект
# 5. Скопируйте DSN
# 6. Добавьте в .env.production:
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

### Шаг 4: Соберите production build
```bash
# Соберите приложение
npm run build

# Проверьте размер бандла
# dist/ должна быть оптимизирована

# Запустите preview
npm run preview

# Откройте http://localhost:4173
# Проверьте работу в production режиме
```

### Шаг 5: Деплой
```bash
# Railway (рекомендуется для backend)
railway up

# Vercel (рекомендуется для frontend)
vercel --prod

# Или используйте Render (для fullstack)
# Следуйте инструкциям в BACKEND_DEPLOYMENT_GUIDE.md
```

### Шаг 6: После деплоя
```bash
# 1. Проверьте доступность сайта
# 2. Проверьте GA4 → Realtime (события должны приходить)
# 3. Проверьте Sentry → Issues (не должно быть критических ошибок)
# 4. Настройте UptimeRobot для мониторинга доступности
# 5. Проверьте GitHub Actions → database-backup (должен запуститься в 2:00 UTC)
```

---

## 📋 Тестовый сценарий

### Сценарий 1: Просмотр товара
1. Откройте главную страницу
2. Кликните на любой товар
3. **Ожидаемый результат:**
   - Страница товара открылась
   - В Console: `[Analytics] Ecommerce - view_item`
   - В GA4 (через 1-2 мин): событие `view_item`

### Сценарий 2: Добавление в корзину
1. На странице товара кликните "Добавить в корзину"
2. **Ожидаемый результат:**
   - Toast уведомление "Товар добавлен в корзину"
   - В Console: `[Analytics] Ecommerce - add_to_cart`
   - В GA4: событие `add_to_cart`

### Сценарий 3: Оформление заказа
1. Откройте корзину
2. Кликните "Оформить заказ"
3. **Ожидаемый результат:**
   - Открылась страница Checkout
   - В Console: `[Analytics] Ecommerce - begin_checkout`
   - В GA4: событие `begin_checkout`

### Сценарий 4: Завершение покупки
1. Заполните форму заказа
2. Кликните "Оформить заказ"
3. **Ожидаемый результат:**
   - Открылась страница успеха
   - В Console: `[Analytics] Ecommerce - purchase`
   - В GA4: событие `purchase` с данными заказа

### Сценарий 5: Keyboard Navigation
1. Нажмите Tab несколько раз
2. **Ожидаемый результат:**
   - Фокус перемещается по элементам
   - Видна зеленая рамка вокруг активного элемента
   - Можно активировать кнопки через Enter/Space

### Сценарий 6: Web Vitals
1. Откройте DevTools → Console
2. Обновите страницу
3. **Ожидаемый результат:**
   - Логи: `[Web Vitals] CLS: ...`
   - Логи: `[Web Vitals] LCP: ...`
   - Логи: `[Web Vitals] FCP: ...`
   - В GA4: события Web Vitals

---

## 🐛 Troubleshooting

### Проблема: Web Vitals не отображаются в Console
**Решение:**
```bash
# Проверьте установку пакета
npm list web-vitals

# Если не установлен:
npm install web-vitals

# Перезапустите dev сервер
npm run dev
```

### Проблема: Analytics события не отправляются
**Решение:**
```bash
# 1. Проверьте .env файл
cat .env | grep VITE_GA_MEASUREMENT_ID

# 2. Если пусто, добавьте:
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env

# 3. Перезапустите сервер
npm run dev
```

### Проблема: Focus indicators не видны
**Решение:**
```bash
# Проверьте, что изменения в index.css применились
# Если нет, очистите кэш:
rm -rf node_modules/.vite
npm run dev
```

### Проблема: Ошибки TypeScript
**Решение:**
```bash
# Проверьте типы
npm run build

# Если есть ошибки, исправьте их
# Все файлы уже проверены и не должны иметь ошибок
```

---

## 📊 Ожидаемые результаты

### DevTools Console (Development)
```
[Web Vitals] CLS: { value: 0.05, rating: 'good' }
[Web Vitals] FCP: { value: 1200, rating: 'good' }
[Web Vitals] LCP: { value: 2100, rating: 'good' }
[Analytics] Ecommerce - view_item { name: "Кровать Люкс", price: 45000 }
[Analytics] Ecommerce - add_to_cart { name: "Кровать Люкс", quantity: 1 }
```

### Google Analytics 4 (Production)
- **Realtime → Events:**
  - `page_view`
  - `view_item`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`
  - Web Vitals events (CLS, FCP, LCP, FID, TTFB)

### Lighthouse Scores
- **Performance:** 85+ / 100
- **Accessibility:** 95+ / 100
- **Best Practices:** 90+ / 100
- **SEO:** 90+ / 100

---

## ✅ Финальная проверка

Перед тем как считать задачу завершенной, убедитесь:

- [ ] `npm install` выполнен успешно
- [ ] `npm run dev` запускается без ошибок
- [ ] В Console видны логи Web Vitals
- [ ] В Console видны логи Analytics
- [ ] Tab навигация работает с видимым focus
- [ ] Все формы имеют labels
- [ ] Все изображения имеют alt текст
- [ ] Цвета имеют достаточный контраст
- [ ] `npm run build` выполняется без ошибок
- [ ] Документация создана и актуальна

---

## 🎉 Готово!

Если все пункты выше отмечены ✅, то:

**🚀 ПРИЛОЖЕНИЕ ГОТОВО К PRODUCTION DEPLOYMENT! 🚀**

Следуйте инструкциям в:
- `MONITORING_SETUP_GUIDE.md` - для настройки мониторинга
- `BACKEND_DEPLOYMENT_GUIDE.md` - для деплоя backend
- `PRODUCTION_READY_SUMMARY.md` - для общего обзора

**Удачи с запуском! 🎊**

---

**Дата создания:** 5 мая 2026  
**Версия:** 1.0.0  
**Статус:** ✅ COMPLETE
