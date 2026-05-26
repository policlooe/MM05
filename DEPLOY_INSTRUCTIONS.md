# 🚀 Инструкция по деплою

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Проверить сборку
```bash
npm run backend:build
```

### 3. Закоммитить и запушить
```bash
git add .
git commit -m "fix: Railway deploy errors"
git push origin main
```

## ✅ Что было исправлено

1. **Stripe API version** - обновлена до `2024-11-20.acacia`
2. **csrf-csrf** - добавлен в dependencies
3. **TypeScript типы** - исправлены для Stripe
4. **Type guards** - добавлены для безопасности типов

## 📋 Checklist перед деплоем

- [ ] `npm install` выполнен успешно
- [ ] `npm run backend:build` проходит без ошибок
- [ ] Все environment variables настроены в Railway
- [ ] `package-lock.json` обновлен

## 🔑 Environment Variables для Railway

```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=...
CSRF_SECRET=...
FRONTEND_URL=https://...
NODE_ENV=production
```

## 📚 Подробная документация

См. `docs/RAILWAY_DEPLOY_FIX.md` для детальной информации.

---

**Статус:** ✅ Готово к деплою
