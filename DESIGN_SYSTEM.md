# 🎨 Design System - MM05 (Ozon Style)

## Обзор

Полноценная система дизайна в стиле Ozon/Wildberries с Design Tokens, базовыми UI компонентами и правилами использования.

## 🎨 Design Tokens (как в Figma)

### Цвета (Semantic Layer)

```css
:root {
  /* Background */
  --bg: 0 0% 100%;           /* #FFFFFF - основной фон */
  --surface: 0 0% 98%;       /* #FAFAFA - поверхности (карточки) */
  
  /* Borders */
  --border: 220 13% 91%;     /* #E5E7EB - границы */
  
  /* Text */
  --foreground: 222 47% 11%; /* #0F172A - основной текст */
  --muted: 220 9% 46%;       /* #64748B - второстепенный текст */
  
  /* Primary/Accent */
  --primary: 221 83% 53%;    /* #3B82F6 - основной цвет */
  --primary-soft: 221 83% 96%; /* #EFF6FF - мягкий фон */
  
  /* Accent (для цен, выделений) */
  --accent: 221 83% 53%;     /* #3B82F6 */
  --accent-soft: 221 83% 95%; /* #DBEAFE */
}
```

### Использование в Tailwind

```tsx
// Background
className="bg-white"        // Основной фон
className="bg-surface"      // Карточки

// Borders
className="border-border"   // Границы

// Text
className="text-foreground" // Основной текст
className="text-muted-foreground" // Второстепенный

// Primary/Accent
className="bg-primary"      // Кнопки, акценты
className="bg-primary/5"    // Мягкий фон (5% opacity)
className="text-primary"    // Цветной текст
```

### 📏 Spacing System (8pt Grid)

**Используем только:**
- `2` (0.5rem / 8px)
- `4` (1rem / 16px)
- `6` (1.5rem / 24px)
- `8` (2rem / 32px)
- `10` (2.5rem / 40px)
- `12` (3rem / 48px)
- `16` (4rem / 64px)
- `20` (5rem / 80px)
- `24` (6rem / 96px)

**Примеры:**
```tsx
// Padding
p-2   // 8px
p-3   // 12px
p-4   // 16px

// Gap
gap-2 // 8px
gap-3 // 12px
gap-4 // 16px

// Margin
mb-2  // 8px
mb-3  // 12px
mb-4  // 16px
```

### 🔤 Typography

```tsx
// Headings
H1: text-2xl font-semibold      // 24px, 600
H2: text-xl font-semibold       // 20px, 600
H3: text-base font-semibold     // 16px, 600

// Body
Body: text-sm                   // 14px
Caption: text-xs text-muted-foreground // 12px

// Special
Price: text-xl font-bold        // 20px, 700
Price Large: text-2xl font-bold // 24px, 700
```

## 🧩 UI Components

### 1. OptionButton

Главный элемент для выбора опций (размер, цвет, изголовье).

**Файл:** `src/components/ui/OptionButton.tsx`

**Использование:**
```tsx
import { OptionButton } from "@/components/ui";

<OptionButton
  selected={isSelected}
  onClick={() => handleSelect()}
  price="+5,000 ₽"
>
  160×200 см
</OptionButton>
```

**Props:**
- `selected: boolean` - выбран ли вариант
- `children: ReactNode` - текст кнопки
- `price?: string` - цена доплаты (опционально)
- `onClick: () => void` - обработчик клика
- `disabled?: boolean` - заблокирована ли кнопка

**Стили:**
- Активный: `border-primary bg-primary/5 text-primary`
- Неактивный: `border-border bg-white`
- Чек справа вверху при выборе

### 2. OptionGroup

Группа опций с заголовком и выбранным значением.

**Файл:** `src/components/ui/OptionGroup.tsx`

**Использование:**
```tsx
import { OptionGroup, OptionButton } from "@/components/ui";

<OptionGroup
  title="Размер"
  value="160×200 см"
  required
>
  <OptionButton selected={true}>140×200 см</OptionButton>
  <OptionButton selected={false}>160×200 см</OptionButton>
  <OptionButton selected={false}>180×200 см</OptionButton>
</OptionGroup>
```

**Props:**
- `title: string` - заголовок группы
- `value?: string` - выбранное значение (показывается справа)
- `children: ReactNode` - кнопки опций
- `required?: boolean` - обязательное ли поле

**Сетка:**
- `grid-cols-2` - 2 колонки на мобильных
- `gap-2` - отступ 8px

### 3. Card

Базовый блок для группировки контента.

**Файл:** `src/components/ui/Card.tsx`

**Использование:**
```tsx
import { Card } from "@/components/ui";

<Card>
  <h3>Заголовок</h3>
  <p>Контент карточки</p>
</Card>
```

**Стили:**
- `bg-white` - белый фон
- `border border-border` - граница
- `rounded-xl` - скругление 12px
- `p-3 sm:p-4` - padding адаптивный
- `shadow-sm` - легкая тень

### 4. Toggle

Переключатель для доп услуг (сборка, матрас).

**Файл:** `src/components/ui/Toggle.tsx`

**Использование:**
```tsx
import { Toggle } from "@/components/ui";

<Toggle
  label="Сборка мебели"
  price="+3,500 ₽"
  description="Профессиональная сборка на дому"
  checked={isChecked}
  onChange={setIsChecked}
/>
```

**Props:**
- `label: string` - название услуги
- `price: string` - цена
- `description?: string` - описание (опционально)
- `checked: boolean` - включена ли услуга
- `onChange: (checked: boolean) => void` - обработчик
- `disabled?: boolean` - заблокирован ли

**Стили:**
- Активный: `border-primary/30 bg-primary/5`
- Неактивный: `border-border`
- Checkbox справа

### 5. DeliveryOption

Опция доставки (radio card).

**Файл:** `src/components/ui/DeliveryOption.tsx`

**Использование:**
```tsx
import { DeliveryOption } from "@/components/ui";

<DeliveryOption
  label="Доставка по городу"
  price="+2,000 ₽"
  selected={isSelected}
  onClick={() => handleSelect()}
/>
```

**Props:**
- `label: string` - название способа доставки
- `price: string` - цена
- `selected: boolean` - выбран ли
- `onClick: () => void` - обработчик
- `disabled?: boolean` - заблокирован ли

**Стили:**
- Активный: `border-primary bg-primary/5`
- Неактивный: `border-border`
- Radio button слева
- Цена справа

### 6. PriceSummary

Итоговая цена (sticky).

**Файл:** `src/components/ui/PriceSummary.tsx`

**Использование:**
```tsx
import { PriceSummary } from "@/components/ui";

<PriceSummary
  price="43,000 ₽"
  oldPrice="56,000 ₽"
  label="Итого:"
  sticky
/>
```

**Props:**
- `price: string` - итоговая цена
- `oldPrice?: string` - старая цена (опционально)
- `label?: string` - текст слева (по умолчанию "Итого:")
- `sticky?: boolean` - прилипает ли к низу
- `className?: string` - дополнительные стили

**Стили:**
- `border-t` - граница сверху
- `bg-white` - белый фон
- `sticky bottom-0` - прилипает к низу (если sticky=true)
- `shadow-[0_-4px_12px_rgba(0,0,0,0.05)]` - тень сверху

## 📱 Mobile-First Layout

### Правила

1. **Всегда используем max-width:**
```tsx
<div className="max-w-6xl mx-auto">
  {/* Контент */}
</div>
```

2. **Padding максимум 12px на мобильных:**
```tsx
className="p-3 sm:p-4"  // 12px mobile, 16px desktop
```

3. **Grid = 2 cols на мобильных:**
```tsx
className="grid grid-cols-2 gap-2"
```

4. **Адаптивные отступы:**
```tsx
className="gap-2 sm:gap-3 md:gap-4"
```

### Breakpoints

```tsx
// Tailwind breakpoints
sm: 640px   // Планшеты
md: 768px   // Десктоп
lg: 1024px  // Большой десктоп
xl: 1280px  // Extra large
```

### Примеры адаптивности

```tsx
// Текст
className="text-sm sm:text-base"

// Padding
className="p-3 sm:p-4 md:p-6"

// Grid
className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

// Gap
className="gap-2 sm:gap-3 md:gap-4"

// Flex direction
className="flex-col sm:flex-row"
```

## 🚀 Использование в проекте

### Импорт компонентов

```tsx
// Все компоненты из одного места
import {
  OptionButton,
  OptionGroup,
  Card,
  Toggle,
  DeliveryOption,
  PriceSummary,
} from "@/components/ui";
```

### Пример: Конфигуратор товара

```tsx
import { OptionGroup, OptionButton, Toggle } from "@/components/ui";

function ProductConfigurator() {
  return (
    <div className="space-y-3">
      {/* Размер */}
      <OptionGroup title="Размер" value="160×200 см" required>
        <OptionButton selected={false}>140×200 см</OptionButton>
        <OptionButton selected={true}>160×200 см</OptionButton>
        <OptionButton selected={false}>180×200 см</OptionButton>
      </OptionGroup>

      {/* Цвет */}
      <OptionGroup title="Цвет" value="Натуральный дуб">
        <OptionButton selected={true}>Натуральный дуб</OptionButton>
        <OptionButton selected={false} price="+2,000 ₽">
          Темный орех
        </OptionButton>
        <OptionButton selected={false} price="+3,000 ₽">
          Белый
        </OptionButton>
      </OptionGroup>

      {/* Сборка */}
      <Toggle
        label="Сборка мебели"
        price="+3,500 ₽"
        description="Профессиональная сборка на дому"
        checked={true}
        onChange={() => {}}
      />
    </div>
  );
}
```

## 📐 Правила дизайна

### 1. Spacing

- Используем только значения из 8pt grid
- Минимальный отступ: `gap-2` (8px)
- Стандартный отступ: `gap-3` (12px)
- Большой отступ: `gap-4` (16px)

### 2. Typography

- Основной текст: `text-sm` (14px)
- Заголовки: `text-base` или `text-xl`
- Мелкий текст: `text-xs` (12px)
- Цены: `text-xl font-bold`

### 3. Colors

- Основной цвет: `primary` (#3B82F6)
- Текст: `foreground` (#0F172A)
- Второстепенный: `muted-foreground` (#64748B)
- Границы: `border` (#E5E7EB)

### 4. Borders

- Стандартная граница: `border border-border`
- Скругление: `rounded-lg` (8px) или `rounded-xl` (12px)
- Активная граница: `border-primary`

### 5. Shadows

- Легкая тень: `shadow-sm`
- Средняя тень: `shadow-md`
- Без тени: по умолчанию

## ✅ Чеклист использования

При создании нового компонента:

- [ ] Используются только UI компоненты из Design System
- [ ] Spacing только из 8pt grid (2, 3, 4, 6, 8...)
- [ ] Typography соответствует системе
- [ ] Цвета из semantic layer
- [ ] Mobile-first подход
- [ ] Max-width для контейнеров
- [ ] Адаптивные отступы (sm:, md:)
- [ ] Нет английских строк в UI

## 📚 Документация компонентов

Каждый компонент имеет:
- TypeScript типы для props
- JSDoc комментарии
- Примеры использования
- Адаптивные стили
- Accessibility (aria-labels, keyboard navigation)

## 🎯 Результат

После внедрения Design System:

✅ **Консистентный UI** - все компоненты выглядят одинаково
✅ **Быстрая разработка** - готовые компоненты
✅ **Легкая поддержка** - изменения в одном месте
✅ **Масштабируемость** - легко добавлять новые компоненты
✅ **Документация** - все описано и понятно

---

**Версия**: 1.0.0
**Дата**: 4 мая 2026
**Статус**: ✅ ГОТОВО
