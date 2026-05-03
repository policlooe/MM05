# 🚀 БЫСТРЫЙ СТАРТ — СИСТЕМА ЗАКАЗОВ

## ✅ ЧТО СДЕЛАНО

Реализована полноценная система заказов с:
- Защитой от перепродажи товара
- Резервированием на складе
- Генерацией накладных
- WhatsApp уведомлениями

---

## 📦 ШАГ 1: ОБНОВИТЬ БАЗУ ДАННЫХ

```bash
cd backend
npx prisma migrate dev --name add_order_reservation_system
npx prisma generate
```

**Что изменилось:**
- Новые статусы заказов (NEW, RESERVED, CONFIRMED, etc.)
- Поле `isStockReserved` для отслеживания резервирования
- Поле `options` в OrderItem для доп. опций

---

## 🔧 ШАГ 2: НАСТРОИТЬ WHATSAPP

### Backend:

**Файл:** `backend/src/controllers/order.create.controller.ts`

```typescript
private static generateWhatsAppUrl(order: any): string {
  const managerPhone = '79288331532'; // ← ИЗМЕНИТЕ НА ВАШ НОМЕР
  // ...
}
```

### Frontend:

**Файл:** `src/lib/contacts.ts`

```typescript
export const CONTACTS = {
  whatsapp: "https://wa.me/79288331532", // ← ИЗМЕНИТЕ НА ВАШ НОМЕР
}
```

---

## 🚀 ШАГ 3: ЗАПУСТИТЬ

### Backend:

```bash
cd backend
npm run dev
```

### Frontend:

```bash
npm run dev
```

---

## 🧪 ШАГ 4: ПРОТЕСТИРОВАТЬ

### Тест 1: Создание заказа

1. Откройте сайт: http://localhost:5173
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
- ✅ Товар списан со склада
- ✅ Страница успеха отображается

### Тест 2: Накладная

1. На странице успеха нажмите "Распечатать накладную"
2. Откроется новая вкладка с HTML накладной

**Ожидаемый результат:**
- ✅ Накладная отображается
- ✅ Все данные заказа присутствуют
- ✅ Можно распечатать (Ctrl+P)

### Тест 3: WhatsApp уведомление

1. На странице успеха нажмите "Написать в WhatsApp"
2. Откроется WhatsApp с готовым сообщением

**Ожидаемый результат:**
- ✅ WhatsApp открывается
- ✅ Сообщение содержит данные заказа
- ✅ Номер менеджера правильный

### Тест 4: Защита от перепродажи

1. Откройте 2 вкладки браузера
2. В обеих добавьте последний товар в корзину
3. Одновременно оформите заказ в обеих вкладках

**Ожидаемый результат:**
- ✅ Первый заказ создается успешно
- ✅ Второй заказ получает ошибку "Недостаточно товара"

---

## 📝 ШАГ 5: НАСТРОЙКА (ОПЦИОНАЛЬНО)

### Изменить формат номера заказа:

**Файл:** `backend/src/controllers/order.create.controller.ts`

```typescript
const prefix = `MM05-${year}-`; // ← ИЗМЕНИТЕ ПРЕФИКС
```

**Примеры:**
- `SHOP-2026-0001`
- `ORDER-2026-0001`
- `INV-2026-0001`

### Изменить текст WhatsApp сообщения:

**Файл:** `backend/src/controllers/order.create.controller.ts`

```typescript
const message = `
🛒 *Новый заказ №${order.orderNumber}*
// ← ИЗМЕНИТЕ ТЕКСТ ЗДЕСЬ
`.trim();
```

---

## 🔍 ПРОВЕРКА РАБОТЫ

### Проверить создание заказа:

```bash
# Backend logs
✅ Order created: MM05-2026-0001, Total: 50000 ₽
```

### Проверить резервирование товара:

```sql
-- В базе данных
SELECT id, name, stockQuantity FROM products WHERE id = 'product-id';
-- stockQuantity должен уменьшиться
```

### Проверить заказ в базе:

```sql
SELECT * FROM orders WHERE orderNumber = 'MM05-2026-0001';
-- status должен быть 'NEW'
-- isStockReserved должен быть true
```

---

## ❓ ЧАСТЫЕ ВОПРОСЫ

### Q: Как изменить номер WhatsApp?

**A:** Измените в двух местах:
1. `backend/src/controllers/order.create.controller.ts` (строка 145)
2. `src/lib/contacts.ts` (строка 7)

### Q: Как добавить поле в форму заказа?

**A:** 
1. Обновите схему валидации в `src/pages/Checkout.tsx`
2. Добавьте поле в форму
3. Обновите тип `CreateOrderRequest` в `src/services/order.ts`
4. Обновите контроллер в `backend/src/controllers/order.create.controller.ts`

### Q: Как изменить статус заказа?

**A:** Используйте админ API:
```bash
PATCH /api/orders/:id/status
{
  "status": "CONFIRMED",
  "adminNote": "Подтверждено"
}
```

### Q: Что делать если товар не списывается?

**A:** Проверьте:
1. Миграция применена: `npx prisma migrate status`
2. Prisma client обновлен: `npx prisma generate`
3. Backend перезапущен после изменений

---

## 🎯 РЕЗУЛЬТАТ

После выполнения всех шагов у вас будет:

✅ Работающая система заказов  
✅ Защита от перепродажи  
✅ Резервирование товара  
✅ Генерация накладных  
✅ WhatsApp уведомления  
✅ Готовность к production  

---

## 📚 ДОПОЛНИТЕЛЬНО

**Полная документация:** `ORDER_SYSTEM_COMPLETE.md`

**API Endpoints:**
- `POST /api/orders` — Создание заказа
- `GET /api/orders/:id/invoice` — Накладная
- `PATCH /api/orders/:id/status` — Изменение статуса (admin)

**Файлы для изменения:**
- WhatsApp номер: `backend/src/controllers/order.create.controller.ts` + `src/lib/contacts.ts`
- Формат номера заказа: `backend/src/controllers/order.create.controller.ts`
- Текст сообщения: `backend/src/controllers/order.create.controller.ts`
- Дизайн накладной: `backend/src/controllers/invoice.controller.ts`

---

**Готово! Система работает!** 🎉
