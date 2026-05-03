# ✅ Чеклист деплоя MM05 на Vercel

## 📋 Полный чеклист для production деплоя

---

## Этап 1: Подготовка Git репозитория

### Локальная подготовка

- [ ] Git установлен на компьютере
- [ ] Проект находится в рабочей директории
- [ ] Все изменения сохранены

### Инициализация репозитория

- [ ] Запущен `setup-github.bat` (или выполнены команды вручную)
- [ ] Git репозиторий инициализирован (`git init`)
- [ ] Все файлы добавлены (`git add .`)
- [ ] Создан первый коммит (`git commit -m "Initial commit"`)
- [ ] Ветка переименована в main (`git branch -M main`)

**Проверка:**
```bash
git status
# Должно быть: On branch main, nothing to commit
```

---

## Этап 2: GitHub репозиторий

### Создание репозитория

- [ ] Открыт https://github.com/new
- [ ] Заполнено название: `mm05-furniture-store`
- [ ] Выбрана видимость: Private ✅
- [ ] НЕ добавлены README, .gitignore, License ❌
- [ ] Нажата кнопка "Create repository"

### Загрузка кода

- [ ] Скопированы команды с GitHub
- [ ] Выполнена команда `git remote add origin ...`
- [ ] Выполнена команда `git push -u origin main`
- [ ] Код успешно загружен на GitHub

**Проверка:**
- Откройте `https://github.com/YOUR_USERNAME/mm05-furniture-store`
- Должны быть видны все файлы проекта

---

## Этап 3: Backend на Railway (если еще не задеплоен)

### Подготовка backend

- [ ] Backend код готов к деплою
- [ ] Prisma schema настроен
- [ ] Environment variables подготовлены
- [ ] Stripe ключи получены

### Деплой на Railway

- [ ] Создан проект на Railway
- [ ] Подключен GitHub репозиторий
- [ ] Настроены environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `FRONTEND_URL`
- [ ] Backend успешно задеплоен
- [ ] Получен production URL

**Проверка:**
```bash
curl https://your-backend.railway.app/api/health
# Должен вернуть: {"status":"ok"}
```

---

## Этап 4: Vercel импорт

### Подключение к Vercel

- [ ] Открыт https://vercel.com/
- [ ] Выполнен вход через GitHub
- [ ] Нажата кнопка "Add New..." → "Project"

### Импорт репозитория

- [ ] Найден репозиторий `mm05-furniture-store`
- [ ] Нажата кнопка "Import"

### Настройка проекта

- [ ] Framework Preset: **Vite**
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Environment Variables

- [ ] `VITE_SUPABASE_URL` = `https://anwqnlswltdqqjmfogvu.supabase.co`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `VITE_SUPABASE_PROJECT_ID` = `anwqnlswltdqqjmfogvu`
- [ ] `VITE_API_URL` = `https://your-backend.railway.app/api` ⚠️

**⚠️ КРИТИЧНО:** Замените `VITE_API_URL` на реальный URL backend!

### Запуск деплоя

- [ ] Нажата кнопка "Deploy"
- [ ] Деплой запущен
- [ ] Дождались завершения (2-3 минуты)
- [ ] Статус: "Ready"

---

## Этап 5: Проверка функциональности

### Основные страницы

- [ ] Главная страница загружается
- [ ] Страница каталога работает
- [ ] Страница оплаты работает
- [ ] Страница успешной оплаты работает

### Navbar

- [ ] Логотип MM05 отображается
- [ ] Кнопка "Каталог" работает
- [ ] Поиск работает
- [ ] Номер телефона виден
- [ ] Кнопка входа работает
- [ ] Иконка корзины работает
- [ ] Badge корзины показывает количество

### Каталог Sidebar

- [ ] Открывается слева (не справа)
- [ ] Поиск по товарам работает
- [ ] Фильтры по категориям работают
- [ ] Сортировка работает
- [ ] Ценовой диапазон работает
- [ ] Кнопка "Добавить в корзину" работает
- [ ] Счетчик товаров отображается
- [ ] Кнопка сброса фильтров работает
- [ ] Закрывается при клике вне sidebar
- [ ] Сохраняет scroll position страницы

### Корзина

- [ ] Открывается справа
- [ ] Товары отображаются
- [ ] Количество можно изменить
- [ ] Товары можно удалить
- [ ] Итоговая сумма считается правильно
- [ ] Кнопка "Оформить заказ" работает
- [ ] Пустая корзина показывает сообщение

### Авторизация (Supabase)

- [ ] Форма входа работает
- [ ] Форма регистрации работает
- [ ] Email подтверждение работает
- [ ] Выход из аккаунта работает
- [ ] Защищенные страницы требуют авторизации

### Оплата (Stripe)

- [ ] Страница оплаты загружается
- [ ] Товары в заказе отображаются
- [ ] Итоговая сумма правильная
- [ ] Кнопка "Оплатить" работает
- [ ] Редирект на Stripe работает
- [ ] Оплата в рублях (₽)
- [ ] После оплаты редирект на success страницу
- [ ] Webhook обрабатывает платеж
- [ ] Заказ создается в базе данных
- [ ] Статус заказа меняется на PAID
- [ ] Корзина очищается после оплаты

### Анимации (Apple-level)

- [ ] Hero секция fade-in работает
- [ ] Товары появляются с stagger эффектом
- [ ] Hover эффекты на карточках работают
- [ ] Navbar glassmorphism эффект работает
- [ ] Smooth scrolling работает
- [ ] Все анимации плавные (60 FPS)

### Производительность

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Изображения оптимизированы
- [ ] Bundle size разумный

### Мобильная версия

- [ ] Сайт адаптивный
- [ ] Navbar мобильное меню работает
- [ ] Каталог sidebar fullscreen на мобильных
- [ ] Корзина fullscreen на мобильных
- [ ] Формы удобны на мобильных
- [ ] Touch события работают

---

## Этап 6: Настройка домена (опционально)

### Custom Domain

- [ ] Домен куплен
- [ ] DNS настроен
- [ ] Домен добавлен в Vercel
- [ ] SSL сертификат выпущен
- [ ] Домен работает

---

## Этап 7: Мониторинг и аналитика

### Vercel Analytics

- [ ] Vercel Analytics включен
- [ ] Web Vitals отслеживаются
- [ ] Errors логируются

### Stripe Dashboard

- [ ] Webhook настроен
- [ ] Test mode выключен
- [ ] Live mode включен
- [ ] Платежи проходят

### Supabase Dashboard

- [ ] Database работает
- [ ] Auth работает
- [ ] API ключи актуальны

---

## Этап 8: Документация

### Документы созданы

- [ ] `VERCEL_IMPORT_GUIDE.md` - полная инструкция
- [ ] `VERCEL_QUICK_IMPORT.md` - быстрый старт
- [ ] `VERCEL_VISUAL_GUIDE.md` - визуальная инструкция
- [ ] `DEPLOYMENT_CHECKLIST.md` - этот чеклист
- [ ] `setup-github.bat` - автоматизация

### README обновлен

- [ ] Production URL добавлен
- [ ] Инструкции по деплою добавлены
- [ ] Environment variables документированы

---

## Этап 9: Безопасность

### Environment Variables

- [ ] Все секреты в environment variables
- [ ] `.env` файлы в `.gitignore`
- [ ] Production ключи отличаются от dev
- [ ] API ключи не в коде

### CORS

- [ ] Backend CORS настроен
- [ ] Только production URL разрешен
- [ ] Credentials разрешены

### Headers

- [ ] Security headers настроены в `vercel.json`
- [ ] CSP настроен (если нужно)
- [ ] HTTPS enforced

---

## Этап 10: Backup и rollback

### Git

- [ ] Все изменения закоммичены
- [ ] Теги версий созданы
- [ ] Backup ветка создана

### Database

- [ ] Database backup настроен
- [ ] Backup schedule настроен
- [ ] Restore процедура протестирована

### Vercel

- [ ] Предыдущие деплои сохранены
- [ ] Rollback возможен одним кликом

---

## 🎉 Финальная проверка

### Production Ready

- [ ] Все пункты выше выполнены ✅
- [ ] Сайт работает без ошибок
- [ ] Производительность отличная
- [ ] Безопасность настроена
- [ ] Мониторинг работает
- [ ] Документация готова

### Ссылки работают

- [ ] 🌐 Production URL: `https://mm05-furniture-store.vercel.app`
- [ ] 📊 Vercel Dashboard: https://vercel.com/dashboard
- [ ] 🐙 GitHub Repo: `https://github.com/YOUR_USERNAME/mm05-furniture-store`
- [ ] 🚂 Railway Backend: `https://your-backend.railway.app`
- [ ] 💳 Stripe Dashboard: https://dashboard.stripe.com
- [ ] 🗄️ Supabase Dashboard: https://supabase.com/dashboard

---

## 🚀 Готово к запуску!

Ваш магазин MM05 готов к production!

**Следующие шаги:**
1. Объявите о запуске
2. Мониторьте метрики
3. Собирайте feedback
4. Итерируйте и улучшайте

---

## 📞 Поддержка

**Если что-то не работает:**
1. Проверьте этот чеклист
2. Посмотрите логи в Vercel Dashboard
3. Проверьте консоль браузера
4. Проверьте Network tab
5. Напишите в чат для помощи

---

**Удачи с запуском! 🎉**
