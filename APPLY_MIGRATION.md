# 🔧 ПРИМЕНЕНИЕ МИГРАЦИИ БАЗЫ ДАННЫХ

## ⚠️ ВАЖНО: СНАЧАЛА ПРИМЕНИТЕ МИГРАЦИЮ!

Перед запуском backend необходимо применить миграцию базы данных.

---

## 📦 ШАГ 1: ПРИМЕНИТЬ МИГРАЦИЮ

### Вариант А: Автоматическая миграция (рекомендуется)

```bash
cd backend
npx prisma migrate dev --name add_order_reservation_system
```

Эта команда:
1. Создаст миграцию на основе изменений в `schema.prisma`
2. Применит её к базе данных
3. Обновит Prisma Client

### Вариант Б: Ручная миграция (если есть проблемы)

```bash
cd backend
npx prisma migrate deploy
```

---

## 🔄 ШАГ 2: ОБНОВИТЬ PRISMA CLIENT

```bash
cd backend
npx prisma generate
```

Эта команда обновит TypeScript типы для Prisma Client.

---

## ✅ ШАГ 3: ПРОВЕРИТЬ МИГРАЦИЮ

### Проверить статус миграций:

```bash
cd backend
npx prisma migrate status
```

**Ожидаемый результат:**
```
Database schema is up to date!
```

### Проверить схему базы данных:

```bash
cd backend
npx prisma studio
```

Откроется веб-интерфейс для просмотра базы данных.

**Проверьте:**
- ✅ Таблица `orders` имеет поля `is_stock_reserved`, `reserved_at`, `completed_at`
- ✅ Поле `user_id` теперь nullable
- ✅ Поле `customer_email` теперь nullable
- ✅ Поле `delivery_address` имеет тип TEXT
- ✅ Таблица `order_items` имеет поле `options`

---

## 🚀 ШАГ 4: ЗАПУСТИТЬ BACKEND

```bash
cd backend
npm run dev
```

**Ожидаемый результат:**
```
Server running on port 3000
```

---

## 🧪 ШАГ 5: ПРОТЕСТИРОВАТЬ

### Тест 1: Создание заказа

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Иванов Иван",
    "customerPhone": "+79991234567",
    "deliveryAddress": "г. Махачкала, ул. Ленина, 10",
    "items": [
      {
        "productId": "product-id",
        "quantity": 1,
        "price": 50000,
        "finalPrice": 50000
      }
    ],
    "totalPrice": 50000
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "Заказ успешно создан",
  "data": {
    "order": {
      "id": "...",
      "orderNumber": "MM05-2026-0001",
      "status": "NEW",
      "isStockReserved": true,
      ...
    },
    "whatsappUrl": "https://wa.me/79288331532?text=..."
  }
}
```

---

## ❌ ЕСЛИ ВОЗНИКЛИ ОШИБКИ

### Ошибка: "Column 'is_stock_reserved' does not exist"

**Решение:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

⚠️ **ВНИМАНИЕ:** `migrate reset` удалит все данные из базы!

### Ошибка: "Type 'string | undefined' is not assignable to type 'string'"

**Решение:**
1. Убедитесь, что миграция применена: `npx prisma migrate status`
2. Обновите Prisma Client: `npx prisma generate`
3. Перезапустите TypeScript сервер (если используете IDE)

### Ошибка: "Cannot find module '@prisma/client'"

**Решение:**
```bash
cd backend
npm install @prisma/client
npx prisma generate
```

---

## 📝 ЧТО ИЗМЕНИЛОСЬ В БАЗЕ ДАННЫХ

### Таблица `orders`:

**Новые поля:**
- `is_stock_reserved` (BOOLEAN) — флаг резервирования товара
- `reserved_at` (TIMESTAMP) — время резервирования
- `completed_at` (TIMESTAMP) — время завершения заказа

**Изменения:**
- `user_id` теперь nullable (для гостевых заказов)
- `customer_email` теперь nullable
- `delivery_address` изменен с JSONB на TEXT

### Таблица `order_items`:

**Новые поля:**
- `options` (JSONB) — дополнительные опции (сборка, доставка и т.д.)

### Enum `OrderStatus`:

**Новые значения:**
- `NEW` — новый заказ
- `RESERVED` — товар зарезервирован
- `COMPLETED` — заказ завершен

---

## 🔍 ПРОВЕРКА ДАННЫХ

### SQL запросы для проверки:

```sql
-- Проверить структуру таблицы orders
\d orders

-- Проверить структуру таблицы order_items
\d order_items

-- Проверить enum OrderStatus
SELECT enum_range(NULL::OrderStatus);

-- Проверить заказы с резервированием
SELECT id, orderNumber, status, isStockReserved, reservedAt
FROM orders
WHERE isStockReserved = true;
```

---

## ✅ ГОТОВО!

После выполнения всех шагов:

✅ Миграция применена  
✅ Prisma Client обновлен  
✅ Backend запущен  
✅ Система заказов работает  

**Следующий шаг:** Запустите frontend и протестируйте создание заказа!

```bash
npm run dev
```

Откройте http://localhost:5173 и оформите тестовый заказ.

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- **Полная документация:** `ORDER_SYSTEM_COMPLETE.md`
- **Быстрый старт:** `ORDER_SYSTEM_QUICK_START.md`
- **Prisma документация:** https://www.prisma.io/docs/concepts/components/prisma-migrate
