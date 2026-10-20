# Локальная база данных MM05

PostgreSQL 18 для разработки без установки в систему и без прав администратора.
Кластер и бинарники лежат в `.localdb/` (в git не попадают).

| Параметр | Значение |
|---|---|
| Хост / порт | `127.0.0.1:5433` |
| Пользователь | `postgres` (trust, без пароля — только localhost) |
| База | `mm05_dev` |
| Данные кластера | `.localdb/data` |
| Лог | `.localdb/postgres.log` |
| Бинарники | `.localdb/pgsql` (перенесены из npm-пакета `@embedded-postgres/windows-x64`) |

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

## Наполнение данными

В репозитории нет `prisma/seed.ts`: каталог на витрине берётся из
`src/data/products.ts`. Для локальной админки товары можно залить разово:

```sql
INSERT INTO categories (id, name, slug, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Кровати', 'krovati', true, now(), now());
```

## Если бинарников нет

`.localdb/pgsql` в git не хранится. Восстановить:

```bash
npm i --no-save embedded-postgres @embedded-postgres/windows-x64
# затем скопировать node_modules/@embedded-postgres/windows-x64/native → .localdb/pgsql
```

Либо поставить обычный PostgreSQL и указать свой `DATABASE_URL` — больше ничего
в проекте от `.localdb` не зависит.

## Перенос на прод

Локальная база — только для разработки. Прод: PostgreSQL на Railway,
`DATABASE_URL` из плагина, миграции выполняются в `startCommand`
(см. `DEPLOY.md` и корневой `railway.toml`).
