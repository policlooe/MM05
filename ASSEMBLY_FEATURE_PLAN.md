# 🔧 План реализации опции сборки

## 📋 Текущее состояние

### ✅ Что уже реализовано:
1. **База данных** - поле `assemblyPrice` добавлено в Product
2. **Данные товаров** - все товары имеют `assemblyPrice`
3. **Конфигуратор** - поддерживает toggle опции
4. **Корзина** - сохраняет конфигурацию и finalPrice
5. **Заказы** - сохраняют options в OrderItem
6. **Накладная** - уже реализована (печать HTML)
7. **WhatsApp уведомления** - уже реализованы
8. **Статусы заказов** - уже реализованы (8 статусов)
9. **Защита от перепродажи** - уже реализована (row-level locking)

### ⚠️ Что нужно доработать:
1. Сделать цену сборки динамической (из `product.assemblyPrice`)
2. Убедиться, что сборка сохраняется в корзине
3. Убедиться, что сборка отображается в заказе
4. Убедиться, что сборка отображается в накладной

---

## 🎯 Решение

### 1. Обновить конфигурацию товаров

Вместо захардкоженной цены сборки в конфигурации, будем использовать `product.assemblyPrice`:

```typescript
// В src/data/products.ts
configuration: {
  variants: [...],
  options: [
    {
      id: "assembly",
      label: "Сборка мебели",
      description: "Профессиональная сборка на дому",
      type: "toggle",
      price: 0, // Будет заменено на product.assemblyPrice
      defaultValue: false,
    },
    // ... другие опции
  ],
}
```

### 2. Обновить ProductPage

При передаче конфигурации в ProductConfigurator, заменить цену сборки:

```typescript
// В src/pages/ProductPage.tsx
const configWithAssemblyPrice = useMemo(() => {
  if (!product.configuration) return undefined;
  
  return {
    ...product.configuration,
    options: product.configuration.options?.map(option => {
      if (option.id === 'assembly' && product.assemblyPrice) {
        return { ...option, price: product.assemblyPrice };
      }
      return option;
    }),
  };
}, [product]);

// Использовать:
<ProductConfigurator
  basePrice={product.price}
  configuration={configWithAssemblyPrice}
  onConfigChange={handleConfigChange}
/>
```

### 3. Проверить корзину

Корзина уже сохраняет:
- `finalPrice` - итоговая цена с учетом всех опций
- `configuration` - выбранная конфигурация (включая сборку)

Нужно убедиться, что при отображении в корзине показывается, что сборка включена.

### 4. Проверить заказ

OrderItem уже имеет:
- `options` - JSON поле для хранения опций
- `productSnapshot` - сохраняет всю информацию о товаре

Нужно убедиться, что сборка сохраняется в `options`.

### 5. Обновить накладную

Накладная должна показывать, если сборка включена:

```typescript
// В backend/src/controllers/invoice.controller.ts
// В HTML шаблоне добавить:
${item.options?.assembly ? `
  <tr>
    <td colspan="3" style="padding: 4px 12px; text-align: right; font-size: 12px; color: #6b7280;">
      + Сборка мебели
    </td>
    <td style="padding: 4px 12px; text-align: right; font-size: 12px; color: #6b7280;">
      ${assemblyPrice} ₽
    </td>
  </tr>
` : ''}
```

---

## 📝 Изменения в коде

### Файлы для изменения:

1. **src/pages/ProductPage.tsx** - добавить динамическую цену сборки
2. **src/components/CartSidebar.tsx** - показывать, что сборка включена
3. **backend/src/controllers/invoice.controller.ts** - показывать сборку в накладной
4. **backend/src/controllers/order.create.controller.ts** - убедиться, что options сохраняются

---

## ✅ Проверка

После внесения изменений проверить:

1. ✅ Открыть товар с assemblyPrice
2. ✅ Включить опцию "Сборка мебели"
3. ✅ Проверить, что цена изменилась
4. ✅ Добавить в корзину
5. ✅ Проверить, что в корзине показано "Сборка включена"
6. ✅ Оформить заказ
7. ✅ Проверить, что в заказе сохранена опция сборки
8. ✅ Открыть накладную
9. ✅ Проверить, что в накладной показана сборка

---

## 🎨 UI/UX

### В конфигураторе:
```
☐ Сборка мебели                    +3,500 ₽
  Профессиональная сборка на дому
```

### В корзине:
```
Кровать «Альмак»
160×200 см, Натуральный дуб
✓ Сборка мебели (+3,500 ₽)
48,000 ₽
```

### В накладной:
```
1. Кровать «Альмак»              1 шт    48,000 ₽
   + Сборка мебели                         3,500 ₽
   Итого:                                 51,500 ₽
```

---

## 🚀 Готово!

Все необходимые изменения минимальны, так как большая часть функциональности уже реализована.

**Основная задача:** Сделать цену сборки динамической из `product.assemblyPrice`.
