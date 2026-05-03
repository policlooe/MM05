# 🎯 Amazon-Level Product Configuration System

## ✅ Что реализовано

### 1. Типы и структура данных

**Файл:** `src/types/product-config.ts`

**Основные типы:**
- `VariantOption` - опция варианта (цвет, размер, материал)
- `Variant` - группа вариантов
- `ToggleOption` - переключаемая опция (сборка, матрас)
- `SelectOption` - выбираемая опция (доставка)
- `ProductConfiguration` - полная конфигурация товара
- `SelectedConfiguration` - выбранная конфигурация
- `ConfiguredProduct` - товар с конфигурацией для корзины

**Функции:**
- `calculateConfiguredPrice()` - расчет итоговой цены
- `checkDependencies()` - проверка зависимостей
- `getConfigurationSummary()` - описание конфигурации

---

### 2. Компонент конфигуратора

**Файл:** `src/components/ProductConfigurator.tsx`

**Компоненты:**
- `ProductConfigurator` - главный компонент
- `VariantSelector` - выбор вариантов (цвет, размер)
- `ToggleOptionSelector` - toggle опции (сборка)
- `SelectOptionSelector` - select опции (доставка)

**Особенности:**
- ✅ Мгновенный пересчет цены
- ✅ Анимации Framer Motion
- ✅ Disabled состояния при зависимостях
- ✅ Визуальная обратная связь
- ✅ Адаптивный дизайн

---

### 3. Пример конфигурируемого товара

**Файл:** `src/data/products.ts`

**Товар:** Кровать «Альмак»

**Варианты:**
1. **Размер спального места:**
   - 140×200 см (полуторная) - 5000 ₽
   - 160×200 см (двуспальная) - базовая цена
   - 180×200 см (king size) +8000 ₽

2. **Цвет покрытия:**
   - Натуральный дуб - базовая цена
   - Темный орех +2000 ₽
   - Белый +3000 ₽

3. **Изголовье:**
   - Стандартное - базовая цена
   - Мягкое (ткань) +5000 ₽
   - Мягкое (кожа) +12000 ₽

**Опции:**
1. **Сборка мебели** (toggle)
   - Базовая цена: 3500 ₽
   - Для king size: +1500 ₽ (зависимость)

2. **Добавить матрас** (toggle)
   - Цена: 15000 ₽

3. **Доставка и подъем** (select)
   - Самовывоз: бесплатно
   - Доставка по городу: 2000 ₽
   - Подъем до 5 этажа: 3500 ₽
   - Подъем выше 5 этажа: 5000 ₽

---

## 🎯 Система зависимостей

### Пример 1: Цена сборки зависит от размера

```typescript
{
  id: "assembly",
  type: "toggle",
  price: 3500,
  dependencies: {
    variant: { size: "180x200" },
    priceModifier: 1500, // +1500₽ для king size
  },
}
```

**Логика:**
- Если выбран размер 180×200 → сборка стоит 5000₽
- Иначе → сборка стоит 3500₽

### Пример 2: Опция недоступна без варианта

```typescript
{
  id: "premium_delivery",
  type: "toggle",
  dependencies: {
    variant: { material: "leather" },
  },
}
```

**Логика:**
- Опция доступна только если выбран материал "кожа"
- Иначе → disabled

---

## 💾 Сохранение в корзину

### Структура данных:

```typescript
{
  productId: "p1",
  name: "Кровать «Альмак»",
  basePrice: 48000,
  configuration: {
    variants: {
      size: "180x200",
      color: "dark",
      headboard: "leather"
    },
    options: {
      assembly: true,
      mattress: true,
      delivery: "floor_1_5"
    }
  },
  finalPrice: 83500,
  quantity: 1,
  image: "/path/to/image.jpg"
}
```

### Отображение в корзине:

```
Кровать «Альмак»
├─ Размер: 180×200 см (king size)
├─ Цвет: Темный орех
├─ Изголовье: Мягкое (кожа)
├─ Сборка мебели
├─ Матрас ортопедический
└─ Доставка + подъем до 5 этажа

Итого: 83 500 ₽
```

---

## 🔧 Интеграция с ProductPage

### Использование:

```typescript
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { SelectedConfiguration } from "@/types/product-config";

// В компоненте
const [config, setConfig] = useState<SelectedConfiguration | null>(null);
const [finalPrice, setFinalPrice] = useState(product.price);

const handleConfigChange = (
  newConfig: SelectedConfiguration,
  price: number
) => {
  setConfig(newConfig);
  setFinalPrice(price);
};

// В JSX
{product.configuration && (
  <ProductConfigurator
    basePrice={product.price}
    configuration={product.configuration}
    onConfigChange={handleConfigChange}
  />
)}
```

---

## 🎨 UX Features

### 1. Мгновенный пересчет цены
```typescript
// Анимация при изменении цены
<motion.span
  key={finalPrice}
  initial={{ scale: 1.1, color: "hsl(var(--accent))" }}
  animate={{ scale: 1, color: "hsl(var(--foreground))" }}
>
  {formatPrice(finalPrice)}
</motion.span>
```

### 2. Визуальная обратная связь
- ✅ Выбранный вариант: зеленая рамка + галочка
- ✅ Hover: scale 1.05
- ✅ Active: scale 0.95
- ✅ Disabled: opacity 0.5 + курсор not-allowed

### 3. Disabled опции
```typescript
{disabled && (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <Info className="w-3 h-3" />
    <span>Недоступно для текущей конфигурации</span>
  </div>
)}
```

---

## 🚀 Backend Ready

### API Structure:

```typescript
// GET /api/products/:id
{
  id: "p1",
  name: "Кровать «Альмак»",
  basePrice: 48000,
  configuration: {
    variants: [...],
    options: [...]
  }
}

// POST /api/cart/add
{
  productId: "p1",
  configuration: {
    variants: { size: "180x200", ... },
    options: { assembly: true, ... }
  },
  quantity: 1
}

// POST /api/orders/create
{
  items: [
    {
      productId: "p1",
      configuration: {...},
      finalPrice: 83500,
      quantity: 1
    }
  ]
}
```

---

## 📱 Адаптивность

### Mobile (320px - 767px):
- Варианты: 2 колонки
- Опции: полная ширина
- Кнопки: минимум 44px высота

### Tablet (768px - 1023px):
- Варианты: 3-4 колонки
- Опции: полная ширина

### Desktop (1024px+):
- Варианты: flex-wrap
- Опции: полная ширина
- Максимальная ширина: 600px

---

## ✅ Готово к использованию

**Файлы созданы:**
1. `src/types/product-config.ts` - типы и утилиты
2. `src/components/ProductConfigurator.tsx` - UI компонент
3. `src/data/products.ts` - обновлен с примером

**Следующие шаги:**
1. Интегрировать в ProductPage
2. Обновить корзину для отображения конфигурации
3. Добавить сохранение в localStorage/Zustand
4. Интегрировать с backend API

---

## 🎓 Расширение системы

### Добавление нового товара с конфигурацией:

```typescript
{
  id: "sofa-01",
  name: "Диван Premium",
  price: 50000,
  configuration: {
    variants: [
      {
        id: "color",
        label: "Цвет",
        type: "color",
        required: true,
        options: [
          { value: "black", label: "Черный", priceModifier: 0 },
          { value: "white", label: "Белый", priceModifier: 2000 },
        ],
      },
    ],
    options: [
      {
        id: "assembly",
        label: "Сборка",
        type: "toggle",
        price: 5000,
      },
    ],
  },
}
```

---

**Статус:** ✅ Система готова к интеграции  
**Версия:** 3.0.0  
**Дата:** 3 мая 2026
