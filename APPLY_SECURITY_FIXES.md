# 🚀 Инструкция по применению исправлений безопасности

## ⚡ Быстрый старт

### Шаг 1: Генерация секретов

```bash
# Генерируем 3 уникальных секрета
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Шаг 2: Обновление .env файлов

**Development (`backend/.env`):**
```env
# JWT Secrets
JWT_ACCESS_SECRET="<вставьте-сгенерированный-секрет-1>"
JWT_REFRESH_SECRET="<вставьте-сгенерированный-секрет-2>"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CSRF Protection
CSRF_SECRET="<вставьте-сгенерированный-секрет-3>"

# Admin Credentials
ADMIN_EMAIL="admin@mm05.ru"
ADMIN_PASSWORD="<ваш-безопасный-пароль-минимум-8-символов>"
ADMIN_FULL_NAME="Администратор"
```

**Production:**
- Используйте secrets manager (AWS Secrets Manager, Azure Key Vault, Vercel Env Variables)
- НЕ используйте те же секреты, что и в development

### Шаг 3: Создание админа

```bash
cd backend
npm run create-admin
```

Вы увидите:
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@mm05.ru
👤 Full Name: Администратор
🛡️  Role: ADMIN
🆔 ID: <uuid>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ВАЖНО: Сохраните учетные данные в безопасном месте!
⚠️  Пароль НЕ отображается в целях безопасности.
```

### Шаг 4: Проверка

```bash
# Запуск приложения
cd backend
npm run dev

# Если секреты не установлены, вы увидите:
# Error: CRITICAL: JWT_ACCESS_SECRET environment variable is not set
```

---

## 🔒 Что было исправлено

### 1. JWT Secrets ✅
- Убраны fallback значения
- Приложение не запустится без секретов
- Fail-fast подход

### 2. CSRF Secret ✅
- Убран fallback
- Обязательная проверка при старте

### 3. Admin Credentials ✅
- Убран хардкод
- Env-driven подход
- Пароль не логируется

### 4. Auth Refresh ✅
- Выровнен контракт API
- Cookie-only подход

### 5. dangerouslySetInnerHTML ✅
- Добавлена валидация цветов
- Санитизация ID и ключей
- Защита от XSS

### 6. simple-server ✅
- Блокировка в production
- Добавлен в .gitignore
- Предупреждения в dev

---

## ⚠️ Важные замечания

### Для Development:
```bash
# Используйте уникальные секреты
# НЕ используйте example значения из .env.example
```

### Для Production:
```bash
# 1. Используйте secrets manager
# 2. Генерируйте новые секреты (не из dev)
# 3. Убедитесь, что simple-server не деплоится
# 4. Проверьте NODE_ENV=production
```

---

## 🧪 Тестирование

### Проверка fail-fast:
```bash
# Удалите JWT_ACCESS_SECRET из .env
# Запустите приложение
npm run dev

# Ожидаемый результат: ошибка при старте
# Error: CRITICAL: JWT_ACCESS_SECRET environment variable is not set
```

### Проверка auth flow:
```bash
# 1. Запустите приложение с правильными секретами
npm run dev

# 2. Попробуйте залогиниться
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mm05.ru","password":"<ваш-пароль>"}'

# 3. Проверьте refresh token (должен работать через cookie)
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=<token-from-login>" \
  --cookie-jar cookies.txt
```

---

## 📋 Чеклист

- [ ] Сгенерированы 3 уникальных секрета
- [ ] Обновлен `backend/.env` с новыми секретами
- [ ] Установлены ADMIN_EMAIL и ADMIN_PASSWORD
- [ ] Запущен `npm run create-admin`
- [ ] Приложение запускается без ошибок
- [ ] Логин работает с новыми креденшалами
- [ ] Refresh token работает через cookie
- [ ] simple-server не используется
- [ ] Production secrets настроены отдельно
- [ ] Все тесты проходят

---

## 🆘 Troubleshooting

### Ошибка: "JWT_ACCESS_SECRET environment variable is not set"
**Решение:** Добавьте секрет в `.env` файл

### Ошибка: "ADMIN_EMAIL environment variable is required"
**Решение:** Добавьте ADMIN_EMAIL и ADMIN_PASSWORD в `.env`

### Ошибка: "Admin user already exists"
**Решение:** Админ уже создан, используйте существующие креденшалы или удалите из БД

### simple-server не запускается в production
**Решение:** Это правильно! Используйте `backend/src/index.ts`

---

## 📚 Дополнительные ресурсы

- Полный отчет: `SECURITY_FIXES_REPORT.md`
- Environment variables: `backend/.env.example`
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

**Последнее обновление:** 2024  
**Статус:** ✅ Готово к применению
