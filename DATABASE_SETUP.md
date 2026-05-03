# 🗄️ НАСТРОЙКА БАЗЫ ДАННЫХ

## ⚠️ ВАЖНО: База данных недоступна

Текущая база данных Supabase недоступна. Есть два варианта:

---

## 🔧 ВАРИАНТ 1: ЛОКАЛЬНАЯ РАЗРАБОТКА (Рекомендуется)

### Шаг 1: Установить PostgreSQL локально

**Windows:**
```bash
# Скачать и установить PostgreSQL
https://www.postgresql.org/download/windows/

# Или через Chocolatey
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Шаг 2: Создать локальную базу данных

```bash
# Войти в PostgreSQL
psql -U postgres

# Создать базу данных
CREATE DATABASE mm05_dev;

# Создать пользователя (опционально)
CREATE USER mm05_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mm05_dev TO mm05_user;

# Выйти
\q
```

### Шаг 3: Обновить .env файл

**Файл:** `backend/.env`

```env
# Локальная база данных
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mm05_dev"

# Или если создали пользователя
DATABASE_URL="postgresql://mm05_user:your_password@localhost:5432/mm05_dev"
```

### Шаг 4: Применить миграцию

```bash
cd backend
npx prisma migrate dev --name add_order_reservation_system
npx prisma generate
```

### Шаг 5: Запустить backend

```bash
npm run dev
```

---

## ☁️ ВАРИАНТ 2: SUPABASE (Production)

### Шаг 1: Создать проект в Supabase

1. Откройте https://supabase.com
2. Войдите или зарегистрируйтесь
3. Создайте новый проект
4. Выберите регион (ближайший к вам)
5. Установите пароль базы данных

### Шаг 2: Получить строку подключения

1. В Supabase перейдите в **Settings** → **Database**
2. Найдите **Connection string** → **URI**
3. Скопируйте строку подключения

**Пример:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Шаг 3: Обновить .env файл

**Файл:** `backend/.env`

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

⚠️ **Замените `[YOUR-PASSWORD]` на ваш пароль!**

### Шаг 4: Применить миграцию

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

⚠️ **Используйте `migrate deploy` для production, не `migrate dev`!**

### Шаг 5: Запустить backend

```bash
npm run dev
```

---

## 🐳 ВАРИАНТ 3: DOCKER (Быстрый старт)

### Шаг 1: Создать docker-compose.yml

**Файл:** `backend/docker-compose.yml`

```yaml
version: '3.8'

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
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Шаг 2: Запустить PostgreSQL

```bash
cd backend
docker-compose up -d
```

### Шаг 3: Обновить .env файл

**Файл:** `backend/.env`

```env
DATABASE_URL="postgresql://mm05_user:mm05_password@localhost:5432/mm05_dev"
```

### Шаг 4: Применить миграцию

```bash
npx prisma migrate dev --name add_order_reservation_system
npx prisma generate
```

### Шаг 5: Запустить backend

```bash
npm run dev
```

---

## 🔍 ПРОВЕРКА ПОДКЛЮЧЕНИЯ

### Тест 1: Проверить подключение к базе

```bash
cd backend
npx prisma db pull
```

**Ожидаемый результат:**
```
✔ Introspected 0 models and wrote them into prisma/schema.prisma
```

### Тест 2: Открыть Prisma Studio

```bash
cd backend
npx prisma studio
```

Откроется веб-интерфейс на http://localhost:5555

---

## 📝 ТЕКУЩАЯ КОНФИГУРАЦИЯ

**Файл:** `backend/.env`

```env
DATABASE_URL="postgresql://postgres.anwqnlswltdqqjmfogvu:[PASSWORD]@db.anwqnlswltdqqjmfogvu.supabase.co:5432/postgres"
```

**Проблема:** База данных недоступна или пароль неверный.

**Решение:**
1. Проверьте пароль в Supabase
2. Или используйте локальную базу данных (Вариант 1)
3. Или используйте Docker (Вариант 3)

---

## ❓ ЧАСТЫЕ ПРОБЛЕМЫ

### Ошибка: "Can't reach database server"

**Причины:**
- База данных не запущена
- Неверный пароль
- Неверный хост
- Firewall блокирует подключение

**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте строку подключения в `.env`
3. Проверьте пароль
4. Попробуйте локальную базу данных

### Ошибка: "Authentication failed"

**Решение:**
```bash
# Проверьте пароль в Supabase
# Обновите DATABASE_URL в .env
# Попробуйте снова
```

### Ошибка: "Database does not exist"

**Решение:**
```bash
# Создайте базу данных
psql -U postgres
CREATE DATABASE mm05_dev;
\q
```

---

## 🚀 РЕКОМЕНДАЦИЯ

**Для разработки:** Используйте **Вариант 1** (локальная PostgreSQL) или **Вариант 3** (Docker)

**Для production:** Используйте **Вариант 2** (Supabase) или Railway

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- **Prisma документация:** https://www.prisma.io/docs/getting-started
- **Supabase документация:** https://supabase.com/docs
- **PostgreSQL документация:** https://www.postgresql.org/docs/

---

## ✅ ПОСЛЕ НАСТРОЙКИ

Когда база данных настроена и миграция применена:

```bash
# 1. Проверить статус миграций
npx prisma migrate status

# 2. Запустить backend
npm run dev

# 3. Запустить frontend (в другом терминале)
npm run dev

# 4. Открыть в браузере
http://localhost:5173
```

**Готово!** Система заказов работает! 🎉
