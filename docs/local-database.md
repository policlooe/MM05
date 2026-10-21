# Локальная база данных MM05

PostgreSQL 18 для разработки без установки в систему и без прав администратора.
Живёт **вне репозитория** — в `%LOCALAPPDATA%\mm05-localdb`.

| Параметр | Значение |
|---|---|
| Хост / порт | `127.0.0.1:5433` |
| Пользователь | `postgres` (trust, без пароля — только localhost) |
| База | `mm05_dev` (ICU-коллация `ru-RU`) |
| Каталог | `%LOCALAPPDATA%\mm05-localdb` |
| Данные кластера | `%LOCALAPPDATA%\mm05-localdb\data` |
| Бинарники | `%LOCALAPPDATA%\mm05-localdb\pgsql` |
| Лог | `%LOCALAPPDATA%\mm05-localdb\postgres.log` |

> **Почему не в репозитории.** Путь проекта содержит кириллицу и длинное тире
> (`Новая папка\MM05 — копия`), а `initdb` и `pg_ctl` на Windows не могут
> работать с таким путём: падают на создании каталога и чтении `share`.
> Поэтому и бинарники, и кластер лежат в ASCII-пути `%LOCALAPPDATA%`.

## Быстрый старт

```bash
npm run db:local          # поднять PostgreSQL (первый запуск делает initdb)
npm run prisma:migrate    # накатить миграции в mm05_dev
npm run backend:dev       # API на http://127.0.0.1:3000
npm run dev               # фронт на http://127.0.0.1:5173
```

Остановить базу: `npm run db:local:stop`, проверить состояние: `npm run db:local:status`.

## Переменные окружения

`backend/.env` (не коммитится):

```
DATABASE_URL=postgresql://postgres@127.0.0.1:5433/mm05_dev
FRONTEND_URL=http://127.0.0.1:5173
```

`.env.local` в корне (не коммитится) — чтобы фронт ходил в локальный API:

```
VITE_API_URL=http://127.0.0.1:3000/api
```

## Коллация и поиск

База создаётся с ICU-коллацией `ru-RU`:

```sql
CREATE DATABASE mm05_dev TEMPLATE template0 ENCODING 'UTF8'
  LOCALE_PROVIDER icu ICU_LOCALE 'ru-RU' LOCALE 'C';
```

Без ICU (кластер с `LOCALE=C`) `ILIKE` не складывает регистр кириллицы:
поиск «кровать» не находил «Кровать». На проде Railway коллация обычно
`en_US.UTF-8`/ICU, поэтому там `mode: 'insensitive'` в Prisma работает как надо.

## Наполнение данными

Витрина берёт каталог из `src/data/products.ts`; в БД товары заливаются
скриптом-сидером (6 категорий, 8 товаров) — он лежит вне репозитория.
Для ручной проверки достаточно одной категории:

```sql
INSERT INTO categories (id, name, slug, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Кровати', 'krovati', true, now(), now());
```

## Если бинарников нет

`%LOCALAPPDATA%\mm05-localdb` не восстанавливается из git. Пересобрать:

```bash
npm i --no-save embedded-postgres @embedded-postgres/windows-x64
# скопировать node_modules/@embedded-postgres/windows-x64/native
#   → %LOCALAPPDATA%\mm05-localdb\pgsql
npm run db:local
```

Либо поставить обычный PostgreSQL и указать свой `DATABASE_URL` — остальной
проект от локального кластера не зависит.

## Перенос на прод

Локальная база — только для разработки. Прод: PostgreSQL на Railway,
`DATABASE_URL` из плагина, миграции выполняются в `startCommand`
(см. `DEPLOY.md` и корневой `railway.toml`).
