# ✅ Чеклист проверки безопасности

## 🔍 Проверка исправлений

### 1. JWT Secrets - Fail-Fast ✅

**Проверка:**
```bash
# Удалите JWT_ACCESS_SECRET из .env
# Запустите приложение
cd backend
npm run dev
```

**Ожидаемый результат:**
```
Error: CRITICAL: JWT_ACCESS_SECRET environment variable is not set. Application cannot start without it.
```

**Статус:** [ ] Проверено

---

### 2. CSRF Secret - Fail-Fast ✅

**Проверка:**
```bash
# Удалите CSRF_SECRET из .env
# Запустите приложение
cd backend
npm run dev
```

**Ожидаемый результат:**
```
Error: CRITICAL: CSRF_SECRET environment variable is not set. Application cannot start without it.
```

**Статус:** [ ] Проверено

---

### 3. Admin Credentials - Env-Driven ✅

**Проверка:**
```bash
# Проверьте, что в коде нет хардкода
grep -r "Vingonson1967" backend/scripts/
grep -r "Arapat14042012" backend/scripts/

# Попробуйте создать админа без env переменных
unset ADMIN_EMAIL
unset ADMIN_PASSWORD
npm run create-admin
```

**Ожидаемый результат:**
```
Error: ADMIN_EMAIL environment variable is required
```

**Статус:** [ ] Проверено

---

### 4. Auth Refresh - Cookie-Only ✅

**Проверка:**
```bash
# Проверьте схему валидации
cat backend/src/validators/auth.validator.ts | grep -A 5 "refreshSchema"

# Проверьте контроллер
cat backend/src/controllers/auth.controller.ts | grep -A 5 "refresh(req"
```

**Ожидаемый результат:**
- Схема: `z.object({})` (пустая)
- Контроллер: `req.cookies.refreshToken`

**Статус:** [ ] Проверено

---

### 5. dangerouslySetInnerHTML - Валидация ✅

**Проверка:**
```bash
# Проверьте наличие функций санитизации
cat src/components/ui/chart.tsx | grep -A 3 "sanitizeColor"
cat src/components/ui/chart.tsx | grep -A 3 "sanitizeId"
```

**Ожидаемый результат:**
- Функция `sanitizeColor` с regex валидацией
- Функция `sanitizeId` с санитизацией

**Статус:** [ ] Проверено

---

### 6. simple-server - Production Block ✅

**Проверка:**
```bash
# Попробуйте запустить simple-server в production
cd backend
NODE_ENV=production node dist/src/simple-server.js
```

**Ожидаемый результат:**
```
❌ CRITICAL SECURITY ERROR: simple-server.ts cannot be used in production!
❌ This server lacks essential security middleware:
   - No authentication
   - No CSRF protection
   - No helmet security headers
   - No rate limiting
❌ Use the main server (src/index.ts) instead.
```

**Проверьте .gitignore:**
```bash
cat .gitignore | grep simple-server
```

**Ожидаемый результат:**
```
backend/src/simple-server.ts
backend/dist/src/simple-server.js
...
```

**Статус:** [ ] Проверено

---

## 🧪 Функциональное тестирование

### 1. Полный Auth Flow

**Шаг 1: Регистрация**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "fullName": "Test User"
  }' \
  --cookie-jar cookies.txt
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "fullName": "Test User",
      "role": "USER"
    }
  }
}
```

**Статус:** [ ] Проверено

---

**Шаг 2: Логин**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }' \
  --cookie-jar cookies.txt
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... }
  }
}
```

**Проверьте cookies:**
```bash
cat cookies.txt | grep -E "accessToken|refreshToken"
```

**Статус:** [ ] Проверено

---

**Шаг 3: Refresh Token**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  --cookie cookies.txt \
  --cookie-jar cookies.txt
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**Статус:** [ ] Проверено

---

**Шаг 4: Get Current User**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  --cookie cookies.txt
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "USER"
  }
}
```

**Статус:** [ ] Проверено

---

**Шаг 5: Logout**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  --cookie cookies.txt
```

**Ожидаемый результат:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Статус:** [ ] Проверено

---

### 2. Admin Creation

**Проверка:**
```bash
cd backend

# Установите env переменные
export ADMIN_EMAIL="admin@mm05.ru"
export ADMIN_PASSWORD="SecurePassword123!"
export ADMIN_FULL_NAME="Administrator"

# Создайте админа
npm run create-admin
```

**Ожидаемый результат:**
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@mm05.ru
👤 Full Name: Administrator
🛡️  Role: ADMIN
🆔 ID: <uuid>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ВАЖНО: Сохраните учетные данные в безопасном месте!
⚠️  Пароль НЕ отображается в целях безопасности.
```

**Проверьте, что пароль НЕ логируется:**
```bash
npm run create-admin 2>&1 | grep "SecurePassword123!"
```

**Ожидаемый результат:** Пустой вывод (пароль не найден)

**Статус:** [ ] Проверено

---

### 3. Chart Component (dangerouslySetInnerHTML)

**Проверка:**
```typescript
// В тестовом компоненте
import { ChartContainer } from '@/components/ui/chart';

const config = {
  test: {
    color: '#ff0000', // Валидный hex
  },
  malicious: {
    color: 'red; } body { display: none; }', // Попытка CSS injection
  },
};

// Проверьте, что malicious color отфильтрован
```

**Ожидаемый результат:**
- Валидный цвет применяется
- Невалидный цвет игнорируется
- Нет CSS injection

**Статус:** [ ] Проверено

---

## 📋 Финальный чеклист

### Код
- [ ] Нет fallback значений для JWT_ACCESS_SECRET
- [ ] Нет fallback значений для JWT_REFRESH_SECRET
- [ ] Нет fallback значений для CSRF_SECRET
- [ ] Нет хардкода админских креденшалов
- [ ] Пароль админа не логируется
- [ ] refreshSchema не требует body token
- [ ] dangerouslySetInnerHTML имеет валидацию
- [ ] simple-server блокируется в production
- [ ] simple-server добавлен в .gitignore

### Environment
- [ ] JWT_ACCESS_SECRET установлен (минимум 32 символа)
- [ ] JWT_REFRESH_SECRET установлен (минимум 32 символа)
- [ ] CSRF_SECRET установлен (минимум 32 символа)
- [ ] ADMIN_EMAIL установлен
- [ ] ADMIN_PASSWORD установлен (минимум 8 символов)
- [ ] Все секреты уникальны
- [ ] Production secrets отличаются от dev

### Функциональность
- [ ] Приложение не запускается без секретов
- [ ] Регистрация работает
- [ ] Логин работает
- [ ] Refresh token работает через cookie
- [ ] Get current user работает
- [ ] Logout работает
- [ ] Создание админа работает
- [ ] simple-server не запускается в production

### Безопасность
- [ ] Нет секретов в git истории
- [ ] .env файлы в .gitignore
- [ ] Пароли не логируются
- [ ] Токены передаются через httpOnly cookies
- [ ] CSS валидируется перед рендерингом
- [ ] Все тесты проходят

### Документация
- [ ] README обновлен
- [ ] .env.example актуален
- [ ] Инструкции по деплою обновлены
- [ ] Security checklist создан

---

## 🎯 Критерии успеха

### ✅ Все проверки пройдены, если:

1. **Fail-Fast работает**
   - Приложение не запускается без секретов
   - Ясные сообщения об ошибках

2. **Auth Flow работает**
   - Регистрация, логин, refresh, logout
   - Токены в httpOnly cookies
   - Нет токенов в body

3. **Admin Creation работает**
   - Креденшалы из env
   - Пароль не логируется
   - Валидация пароля

4. **Production безопасен**
   - simple-server не запускается
   - Все секреты установлены
   - Нет хардкода

5. **Код чистый**
   - Нет fallback значений
   - Нет хардкода
   - Валидация входных данных

---

## 📊 Результаты проверки

**Дата проверки:** _______________

**Проверяющий:** _______________

**Результат:**
- [ ] ✅ Все проверки пройдены
- [ ] ⚠️ Есть замечания (см. ниже)
- [ ] ❌ Требуются исправления

**Замечания:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

**Подпись:** _______________

---

**Версия чеклиста:** 1.0  
**Дата создания:** 2024
