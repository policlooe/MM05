# 📊 Руководство по настройке мониторинга

## 🎯 Что уже настроено

### ✅ Готово к использованию:
1. **Sentry** - мониторинг ошибок (уже настроен в `src/lib/sentry.ts`)
2. **Google Analytics 4** - веб-аналитика (уже настроен в `src/lib/analytics.ts`)
3. **Web Vitals** - производительность (только что добавлен)
4. **E-commerce tracking** - отслеживание покупок (только что добавлен)

---

## 🔧 Что нужно настроить

### 1. Google Analytics 4 (GA4)

**Шаг 1: Создайте аккаунт GA4**
1. Перейдите на https://analytics.google.com/
2. Создайте новый аккаунт или используйте существующий
3. Создайте новое свойство (Property) для вашего сайта
4. Скопируйте **Measurement ID** (формат: `G-XXXXXXXXXX`)

**Шаг 2: Добавьте Measurement ID в проект**
```bash
# В файле .env или .env.production
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Шаг 3: Проверьте работу**
1. Запустите приложение: `npm run dev`
2. Откройте DevTools → Console
3. Выполните действия на сайте (просмотр товара, добавление в корзину)
4. Проверьте логи: `[Analytics] ...`
5. В GA4 → Realtime → Events (события должны появиться через 1-2 минуты)

---

### 2. Sentry (мониторинг ошибок)

**Шаг 1: Создайте проект в Sentry**
1. Перейдите на https://sentry.io/
2. Создайте новый проект (выберите React)
3. Скопируйте **DSN** (формат: `https://xxx@xxx.ingest.sentry.io/xxx`)

**Шаг 2: Добавьте DSN в проект**
```bash
# В файле .env или .env.production
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

**Шаг 3: Проверьте работу**
1. Запустите приложение
2. Вызовите ошибку (например, откройте несуществующую страницу)
3. Проверьте Sentry → Issues (ошибка должна появиться)

---

### 3. Database Backups (уже настроено)

**Автоматические бэкапы:**
- ✅ GitHub Action создан: `.github/workflows/database-backup.yml`
- ✅ Скрипт бэкапа: `backend/scripts/backup-database.ts`
- ✅ Расписание: каждый день в 2:00 UTC
- ✅ Хранение: 30 дней
- ✅ Уведомления: через GitHub Issues при ошибках

**Ручной бэкап:**
```bash
npm run backup
```

---

## 📈 Дашборды и отчеты

### Google Analytics 4

**Основные отчеты:**
1. **Realtime** - текущие пользователи онлайн
2. **Engagement → Events** - все события (view_item, add_to_cart, purchase)
3. **Monetization → Ecommerce purchases** - статистика покупок
4. **Engagement → Pages and screens** - популярные страницы

**Настройка кастомных отчетов:**
1. GA4 → Explore → Create new exploration
2. Добавьте метрики:
   - Total revenue (общая выручка)
   - Transactions (количество заказов)
   - Average purchase revenue (средний чек)
3. Добавьте измерения:
   - Item name (название товара)
   - Item category (категория)

### Sentry

**Основные разделы:**
1. **Issues** - все ошибки
2. **Performance** - производительность
3. **Releases** - версии приложения
4. **Alerts** - настройка уведомлений

**Настройка алертов:**
1. Sentry → Alerts → Create Alert
2. Выберите условие (например, "When an issue is first seen")
3. Настройте уведомления (email, Slack, Telegram)

---

## 🚨 Мониторинг в реальном времени

### Рекомендуемые инструменты:

#### 1. **Uptime Monitoring** (проверка доступности)
- **UptimeRobot** (бесплатно): https://uptimerobot.com/
  - Проверка каждые 5 минут
  - Уведомления по email/SMS
  - Настройка: добавьте URL вашего сайта

#### 2. **Performance Monitoring**
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
  - Проверка Core Web Vitals
  - Рекомендации по оптимизации
  
- **WebPageTest**: https://www.webpagetest.org/
  - Детальный анализ загрузки
  - Waterfall диаграммы

#### 3. **Real User Monitoring (RUM)**
- **Microsoft Clarity** (бесплатно): https://clarity.microsoft.com/
  - Heatmaps (тепловые карты)
  - Session recordings (записи сессий)
  - Интеграция с GA4

**Настройка Microsoft Clarity:**
1. Создайте проект на https://clarity.microsoft.com/
2. Скопируйте код отслеживания
3. Добавьте в `index.html` перед `</head>`:
```html
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

---

## 📊 Метрики для отслеживания

### Бизнес-метрики:
- **Conversion Rate** (конверсия): (Покупки / Посетители) × 100%
- **Average Order Value** (средний чек): Выручка / Количество заказов
- **Cart Abandonment Rate** (брошенные корзины): (Начали оформление - Завершили) / Начали оформление

### Технические метрики:
- **Core Web Vitals:**
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Error Rate** (частота ошибок): Ошибки / Запросы
- **Uptime** (доступность): > 99.9%

---

## 🔔 Настройка уведомлений

### Критические алерты (немедленно):
- Сайт недоступен (downtime)
- Критические ошибки в Sentry
- Ошибки оплаты (Stripe)
- Ошибки бэкапов базы данных

### Важные алерты (в течение часа):
- Резкое падение конверсии
- Увеличение времени загрузки
- Рост количества ошибок

### Информационные (ежедневно):
- Отчет по продажам
- Статистика посещаемости
- Успешные бэкапы

---

## 📱 Мобильные уведомления

### Telegram Bot (рекомендуется)
1. Создайте бота через @BotFather
2. Получите токен бота
3. Настройте webhook для отправки уведомлений:
   - Sentry → Integrations → Telegram
   - UptimeRobot → Alert Contacts → Telegram

### Slack (для команды)
1. Создайте Slack workspace
2. Настройте интеграции:
   - Sentry → Integrations → Slack
   - GitHub → Integrations → Slack (для уведомлений о деплое)

---

## ✅ Чеклист настройки

### Обязательно:
- [ ] Google Analytics 4 настроен и работает
- [ ] Sentry настроен и получает ошибки
- [ ] Uptime monitoring настроен (UptimeRobot)
- [ ] Database backups работают автоматически
- [ ] Настроены критические алерты

### Рекомендуется:
- [ ] Microsoft Clarity установлен (heatmaps)
- [ ] Telegram bot для уведомлений
- [ ] Slack для командных уведомлений
- [ ] Кастомные дашборды в GA4

### Опционально:
- [ ] A/B тестирование (Google Optimize)
- [ ] Advanced error tracking (LogRocket)
- [ ] APM (Application Performance Monitoring)

---

## 🎓 Полезные ресурсы

### Документация:
- **Google Analytics 4**: https://support.google.com/analytics/
- **Sentry**: https://docs.sentry.io/
- **Web Vitals**: https://web.dev/vitals/

### Обучение:
- **Google Analytics Academy**: https://analytics.google.com/analytics/academy/
- **Sentry University**: https://sentry.io/resources/

### Сообщества:
- **GA4 Reddit**: https://www.reddit.com/r/GoogleAnalytics/
- **Sentry Discord**: https://discord.gg/sentry

---

## 🆘 Troubleshooting

### GA4 не получает события:
1. Проверьте Measurement ID в `.env`
2. Откройте DevTools → Network → Фильтр "google-analytics"
3. Проверьте, отправляются ли запросы к GA4
4. Проверьте GA4 → Admin → Data Streams → Web → Enhanced measurement

### Sentry не получает ошибки:
1. Проверьте DSN в `.env`
2. Проверьте, что `VITE_SENTRY_ENVIRONMENT` установлен
3. Откройте DevTools → Console → Проверьте ошибки инициализации Sentry
4. Попробуйте вызвать тестовую ошибку: `throw new Error("Test error")`

### Web Vitals не отображаются:
1. Проверьте, что `web-vitals` установлен: `npm list web-vitals`
2. Проверьте, что `initWebVitals()` вызывается в `main.tsx`
3. Откройте DevTools → Console → Проверьте логи `[Web Vitals]`

---

## 📞 Поддержка

Если возникли проблемы с настройкой мониторинга:
1. Проверьте логи в DevTools → Console
2. Проверьте переменные окружения в `.env`
3. Перезапустите приложение: `npm run dev`
4. Проверьте документацию соответствующего сервиса

**Дата создания:** 5 мая 2026
