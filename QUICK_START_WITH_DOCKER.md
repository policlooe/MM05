# 🚀 БЫСТРЫЙ СТАРТ С DOCKER

## ✅ Самый простой способ запустить систему заказов

Используйте Docker для локальной базы данных PostgreSQL.

---

## 📦 ШАГ 1: УСТАНОВИТЬ DOCKER

### Windows:
Скачайте и установите Docker Desktop:
https://www.docker.com/products/docker-desktop/

### Mac:
```bash
brew install --cask docker
```

### Linux:
```bash
sudo apt-get install docker docker-compose
```

---

## 🗄️ ШАГ 2: ЗАПУСТИТЬ POSTGRESQL

```bash
cd backend
docker-compose up -d
```

**Что происходит:**
- Скачивается образ PostgreSQL
- Создается контейнер с базой данных
- База данных запускается на порту 5432

**Проверка:**
```bash
docker ps
```

Вы должны увидеть контейнер `mm05_postgres` в статусе `Up`.

---

## 🔧 ШАГ 3: НАСТРОИТЬ .ENV

**Скопируйте файл:**
```bash
cd backend
copy .env.local .env
```

**Или создайте вручную:**

**Файл:** `backend/.env`

```env
DATABASE_URL="postgresql://mm05_user:mm05_password@localhost:5432/mm05_dev"

JWT_ACCESS_SECRET="dev-access-secret-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

STRIPE_SECRET_KEY="sk_test_your_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_secret"

ADMIN_EMAIL="admin@mm05.ru"
ADMIN_PASSWORD="admin123"
ADMIN_FULL_NAME="Администратор"
```

---

## 📊 ШАГ 4: ПРИМЕНИТЬ МИГРАЦИЮ

```bash
cd backend
npx prisma migrate dev --name add_order_reservation_system
npx prisma generate
```

**Ожидаемый результат:**
```
✔ Generated Prisma Client
✔ The migration has been applied successfully
```

---

## 🚀 ШАГ 5: ЗАПУСТИТЬ BACKEND

```bash
cd backend
npm run dev
```

**Ожидаемый результат:**
```
Server running on port 3000
```

---

## 🎨 ШАГ 6: ЗАПУСТИТЬ FRONTEND

**В новом терминале:**

```bash
npm run dev
```

**Ожидаемый результат:**
```
Local: http://localhost:5173
```

---

## ✅ ШАГ 7: ПРОТЕСТИРОВАТЬ

1. Откройте http://localhost:5173
2. Добавьте товары в корзину
3. Нажмите "Оформить заказ"
4. Заполните форму:
   - ФИО: Иванов Иван Иванович
   - Телефон: +79991234567
   - Адрес: г. Махачкала, ул. Ленина, 10
5. Нажмите "Оформить заказ"

**Ожидаемый результат:**
- ✅ Заказ создан
- ✅ Номер заказа: MM05-2026-0001
- ✅ Страница успеха отображается
- ✅ Кнопки "Распечатать накладную" и "Написать в WhatsApp" работают

---

## 🔍 ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

### Открыть Prisma Studio (GUI для базы данных):

```bash
cd backend
npx prisma studio
```

Откроется http://localhost:5555

### Остановить PostgreSQL:

```bash
cd backend
docker-compose down
```

### Перезапустить PostgreSQL:

```bash
cd backend
docker-compose restart
```

### Удалить базу данных и начать заново:

```bash
cd backend
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
```

---

## 📝 СТРУКТУРА DOCKER

**Файл:** `backend/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: mm05_postgres
    environment:
      POSTGRES_USER: mm05_user
      POSTGRES_PASSWORD: mm05_password
      POSTGRES_DB: mm05_dev
    ports:
      - "5432:5432"
```

**Параметры:**
- **User:** mm05_user
- **Password:** mm05_password
- **Database:** mm05_dev
- **Port:** 5432

---

## ❓ ЧАСТЫЕ ПРОБЛЕМЫ

### Ошибка: "Port 5432 is already in use"

**Решение:**
```bash
# Остановить локальный PostgreSQL
# Windows:
net stop postgresql-x64-15

# Mac:
brew services stop postgresql

# Linux:
sudo systemctl stop postgresql
```

### Ошибка: "Docker daemon is not running"

**Решение:**
1. Запустите Docker Desktop
2. Подождите пока Docker запустится
3. Попробуйте снова

### Ошибка: "Can't reach database server"

**Решение:**
```bash
# Проверить что контейнер запущен
docker ps

# Если нет, запустить
cd backend
docker-compose up -d

# Проверить логи
docker logs mm05_postgres
```

---

## 🎯 ИТОГ

После выполнения всех шагов у вас будет:

✅ PostgreSQL в Docker контейнере  
✅ База данных с примененными миграциями  
✅ Backend запущен на http://localhost:3000  
✅ Frontend запущен на http://localhost:5173  
✅ Система заказов работает  

**Готово к разработке!** 🎉

---

## 📚 СЛЕДУЮЩИЕ ШАГИ

1. **Настроить WhatsApp номер:**
   - `backend/src/controllers/order.create.controller.ts` (строка 145)
   - `src/lib/contacts.ts` (строка 7)

2. **Добавить товары в базу данных:**
   - Используйте Prisma Studio: `npx prisma studio`
   - Или создайте seed скрипт

3. **Протестировать все функции:**
   - Создание заказа
   - Резервирование товара
   - Генерация накладной
   - WhatsApp уведомления

4. **Подготовить к production:**
   - Настроить Supabase для production базы данных
   - Задеплоить backend на Railway
   - Задеплоить frontend на Vercel

**Удачи!** 🚀
