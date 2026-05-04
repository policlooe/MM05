# Руководство по расширенной системе конфигурации товаров

## Обзор

Новая система конфигурации товаров поддерживает:

✅ **Варианты с изображениями** - при выборе цвета меняется фото товара  
✅ **Все типы опций** - размер, цвет, изголовье, матрас, доставка  
✅ **Полное управление из админки** - можно добавлять/удалять любые опции  
✅ **Детализация цены** - показывает из чего складывается итоговая цена  
✅ **Валидация** - проверка обязательных полей  

---

## Структура конфигурации

### 1. Варианты (Variants)

Варианты - это основные характеристики товара, которые **обязательно** нужно выбрать:

```typescript
variants: {
  size: {
    label: "Размер спального места",
    required: true,
    options: [
      { 
        value: "140x200", 
        label: "140×200 см (полуторная)", 
        priceModifier: -5000,  // Скидка 5000₽
        default: false
      },
      { 
        value: "160x200", 
        label: "160×200 см (двуспальная)", 
        priceModifier: 0,      // Базовая цена
        default: true          // Выбрано по умолчанию
      },
      { 
        value: "180x200", 
        label: "180×200 см (king size)", 
        priceModifier: 8000    // Доплата 8000₽
      },
    ],
  },
  color: {
    label: "Цвет покрытия",
    required: true,
    options: [
      { 
        value: "natural", 
        label: "Натуральный дуб", 
        priceModifier: 0,
        image: "/images/bed-natural.jpg",  // 🎨 ИЗОБРАЖЕНИЕ для этого цвета
        default: true
      },
      { 
        value: "dark", 
        label: "Темный орех", 
        priceModifier: 2000,
        image: "/images/bed-dark.jpg"      // 🎨 ИЗОБРАЖЕНИЕ для этого цвета
      },
      { 
        value: "white", 
        label: "Белый", 
        priceModifier: 3000,
        image: "/images/bed-white.jpg"     // 🎨 ИЗОБРАЖЕНИЕ для этого цвета
      },
    ],
  },
}
```

### 2. Опции (Options)

Опции - это дополнительные услуги и параметры:

#### Toggle опции (вкл/выкл)

```typescript
options: {
  assembly: {
    label: "Сборка мебели",
    type: "toggle",
    price: 3500,
    description: "Профессиональная сборка на дому",
    default: false,
    disabled: false,                              // Можно отключить
    disabledMessage: "Недоступно для текущей конфигурации"
  },
  mattress: {
    label: "Добавить матрас",
    type: "toggle",
    price: 15000,
    description: "Ортопедический матрас",
    default: false,
  },
}
```

#### Select опции (выбор из списка)

```typescript
options: {
  headboard: {
    label: "Изголовье",
    type: "select",
    required: true,
    options: [
      { 
        value: "standard", 
        label: "Стандартное", 
        priceModifier: 0,
        default: true
      },
      { 
        value: "soft-fabric", 
        label: "Мягкое (ткань)", 
        priceModifier: 5000 
      },
      { 
        value: "soft-leather", 
        label: "Мягкое (кожа)", 
        priceModifier: 12000 
      },
    ],
  },
  delivery: {
    label: "Доставка и подъем",
    type: "select",
    required: true,
    options: [
      { value: "pickup", label: "Самовывоз", priceModifier: 0, default: true },
      { value: "city", label: "Доставка по городу", priceModifier: 2000 },
      { value: "floor5", label: "Доставка + подъем до 5 этажа", priceModifier: 3500 },
      { value: "floor5plus", label: "Доставка + подъем выше 5 этажа", priceModifier: 5000 },
    ],
  },
}
```

---

## Как добавить конфигурацию к товару

### Шаг 1: Подготовьте изображения для цветов

Загрузите фотографии товара в разных цветах:

```
/public/images/
  ├── bed-almak-natural.jpg   (натуральный дуб)
  ├── bed-almak-dark.jpg      (темный орех)
  └── bed-almak-white.jpg     (белый)
```

### Шаг 2: Добавьте конфигурацию в `src/data/products.ts`

```typescript
{
  id: "p1",
  slug: "krovat-almak",
  name: "Кровать «Альмак»",
  price: 46500,  // Базовая цена для размера 160x200
  image: bed1,
  // ... остальные поля
  
  advancedConfiguration: {
    variants: {
      size: { /* ... */ },
      color: {
        label: "Цвет покрытия",
        required: true,
        options: [
          { 
            value: "natural", 
            label: "Натуральный дуб", 
            priceModifier: 0,
            image: "/images/bed-almak-natural.jpg",  // 🎨 Путь к изображению
            default: true
          },
          // ... другие цвета
        ],
      },
    },
    options: {
      headboard: { /* ... */ },
      assembly: { /* ... */ },
      mattress: { /* ... */ },
      delivery: { /* ... */ },
    },
  },
}
```

---

## Расчет цены

Финальная цена рассчитывается так:

```
Итоговая цена = Базовая цена 
              + Модификаторы вариантов (size, color)
              + Модификаторы опций (headboard, delivery)
              + Toggle опции (assembly, mattress)
```

### Пример расчета:

```
Базовая цена:           46 500 ₽
Размер 180×200:         +8 000 ₽
Цвет "Темный орех":     +2 000 ₽
Изголовье мягкое:       +5 000 ₽
Сборка:                 +3 500 ₽
Матрас:                +15 000 ₽
Доставка + подъем:      +3 500 ₽
─────────────────────────────────
ИТОГО:                  83 500 ₽
```

---

## Управление из админки (TODO)

В будущем будет создан интерфейс админки для управления конфигурациями:

### Функции админки:

1. **Добавление/удаление вариантов**
   - Добавить новый размер
   - Добавить новый цвет с изображением
   - Удалить вариант

2. **Управление опциями**
   - Включить/выключить опцию (например, убрать матрас)
   - Изменить цену опции
   - Изменить описание

3. **Загрузка изображений**
   - Загрузить фото для каждого цвета
   - Обрезка и оптимизация изображений

4. **Предпросмотр**
   - Посмотреть как выглядит конфигуратор
   - Протестировать расчет цены

---

## API для админки (Backend)

### Структура в базе данных

```sql
-- Поле configuration в таблице products
ALTER TABLE products 
ADD COLUMN configuration JSONB DEFAULT '{}'::jsonb;
```

### Пример JSON в БД:

```json
{
  "variants": {
    "size": {
      "label": "Размер спального места",
      "required": true,
      "options": [
        {
          "value": "140x200",
          "label": "140×200 см (полуторная)",
          "priceModifier": -5000,
          "default": false
        }
      ]
    },
    "color": {
      "label": "Цвет покрытия",
      "required": true,
      "options": [
        {
          "value": "natural",
          "label": "Натуральный дуб",
          "priceModifier": 0,
          "image": "/uploads/bed-almak-natural.jpg",
          "default": true
        }
      ]
    }
  },
  "options": {
    "assembly": {
      "label": "Сборка мебели",
      "type": "toggle",
      "price": 3500,
      "description": "Профессиональная сборка на дому",
      "default": false
    }
  }
}
```

### API endpoints (TODO):

```typescript
// Получить конфигурацию товара
GET /api/admin/products/:id/configuration

// Обновить конфигурацию
PUT /api/admin/products/:id/configuration
Body: { configuration: ProductConfiguration }

// Загрузить изображение для цвета
POST /api/admin/products/:id/configuration/upload-color-image
Body: FormData { colorValue: string, image: File }
```

---

## Использование в компонентах

### В ProductPage:

```tsx
import { ProductConfiguratorAdvanced } from "@/components/ProductConfiguratorAdvanced";

// В компоненте:
{product.advancedConfiguration && (
  <ProductConfiguratorAdvanced
    basePrice={product.price}
    configuration={product.advancedConfiguration}
    defaultImage={product.image}
    onConfigChange={(config, price) => {
      setAdvancedConfig(config);
      setFinalPrice(price);
    }}
    onImageChange={(imageUrl) => {
      setSelectedImage(imageUrl);  // Меняем главное фото
    }}
  />
)}
```

---

## Преимущества новой системы

✅ **Гибкость** - можно добавить любые варианты и опции  
✅ **Визуализация** - изображения для каждого цвета  
✅ **Прозрачность** - детализация цены  
✅ **Управляемость** - все настраивается из админки  
✅ **Масштабируемость** - подходит для любых товаров  

---

## Следующие шаги

1. ✅ Создана структура типов (`product-configuration.ts`)
2. ✅ Создан компонент `ProductConfiguratorAdvanced`
3. ✅ Интегрирован в `ProductPage`
4. ✅ Добавлена конфигурация для кровати Альмак
5. ⏳ Создать миграцию БД для поля `configuration`
6. ⏳ Создать API endpoints для управления конфигурациями
7. ⏳ Создать интерфейс админки для управления
8. ⏳ Добавить загрузку изображений для цветов
9. ⏳ Применить конфигурацию ко всем товарам

---

## Вопросы?

Если нужна помощь с настройкой конфигурации для конкретного товара - пишите!
