# 🎯 Строгая система иконок MM05

## Библиотека
**Только Lucide Icons:** https://lucide.dev

## Размеры иконок (строго)

```tsx
// XS - 12px (очень редко)
<Icon className="w-3 h-3 stroke-2" />

// SM - 16px (кнопки, inline элементы)
<Icon className="w-4 h-4 stroke-2" />

// MD - 20px (по умолчанию)
<Icon className="w-5 h-5 stroke-[1.5]" />

// LG - 24px (заголовки секций)
<Icon className="w-6 h-6 stroke-[1.5]" />

// XL - 32px (hero секции)
<Icon className="w-8 h-8 stroke-[1.5]" />
```

## Правила stroke (толщина линий)

### Для иконок 16px (w-4 h-4):
```tsx
<Icon className="w-4 h-4 stroke-2" />
```

### Для иконок 20px+ (w-5 h-5 и больше):
```tsx
<Icon className="w-5 h-5 stroke-[1.5]" />
<Icon className="w-6 h-6 stroke-[1.5]" />
<Icon className="w-8 h-8 stroke-[1.5]" />
```

## Цвета иконок

```tsx
// Основной цвет
<Icon className="text-foreground" />

// Вторичный (приглушенный)
<Icon className="text-muted-foreground" />

// Акцент (зеленый)
<Icon className="text-accent" />

// Белый (на темном фоне)
<Icon className="text-white" />

// Ошибка
<Icon className="text-destructive" />
```

## Использование по контексту

### Кнопки
```tsx
<button className="...">
  <ShoppingCart className="w-4 h-4 stroke-2" />
  В корзину
</button>
```

### Навигация
```tsx
<Link className="...">
  <Home className="w-5 h-5 stroke-[1.5]" />
  Главная
</Link>
```

### Badges/Счетчики
```tsx
<span className="...">
  <Heart className="w-3 h-3 stroke-2" />
  5
</span>
```

### Заголовки секций
```tsx
<h2 className="...">
  <Package className="w-6 h-6 stroke-[1.5]" />
  Доставка
</h2>
```

### Inline текст
```tsx
<p className="...">
  <MapPin className="w-4 h-4 stroke-2" />
  Махачкала
</p>
```

## Выравнивание с текстом

### Inline элементы
```tsx
<div className="inline-flex items-center gap-2">
  <Phone className="w-4 h-4 stroke-2 text-accent" />
  <span className="text-sm">+7 928 833-15-32</span>
</div>
```

### Вертикальное выравнивание
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-5 h-5 stroke-[1.5] shrink-0" />
  <span>Текст</span>
</div>
```

### С многострочным текстом
```tsx
<div className="flex items-start gap-2">
  <Icon className="w-5 h-5 stroke-[1.5] shrink-0 mt-0.5" />
  <div>
    <p>Многострочный</p>
    <p>текст</p>
  </div>
</div>
```

## Примеры из проекта

### Footer - Контакты
```tsx
// ✅ ПРАВИЛЬНО
<a className="inline-flex items-center gap-2">
  <Phone className="w-4 h-4 stroke-2 text-accent" />
  +7 928 833-15-32
</a>

// ❌ НЕПРАВИЛЬНО
<a className="inline-flex items-center gap-2">
  <Phone className="w-5 h-5 stroke-[1.15]" /> // Неправильный stroke
  +7 928 833-15-32
</a>
```

### Promotions - Кнопка "Все товары"
```tsx
// ✅ ПРАВИЛЬНО
<Link className="...">
  <ShoppingBag className="w-4 h-4 stroke-2" />
  Все товары
</Link>

// ❌ НЕПРАВИЛЬНО
<Link className="...">
  Все товары → // Стрелка текстом вместо иконки
</Link>
```

### Карточки товаров
```tsx
// ✅ ПРАВИЛЬНО
<button className="...">
  <ShoppingCart className="w-4 h-4 stroke-2" />
  В корзину
</button>

// ❌ НЕПРАВИЛЬНО
<button className="...">
  <ShoppingCart className="w-4 h-4" /> // Нет stroke
  В корзину
</button>
```

## Запрещено

### ❌ Произвольные размеры
```tsx
<Icon className="w-[18px] h-[18px]" /> // НЕТ!
<Icon className="w-7 h-7" />           // НЕТ! (28px не в системе)
```

### ❌ Произвольные stroke
```tsx
<Icon className="stroke-[1.15]" />  // НЕТ!
<Icon className="stroke-[2.5]" />   // НЕТ!
<Icon className="stroke-1" />       // НЕТ!
```

### ❌ Смешивание библиотек
```tsx
import { Icon } from 'react-icons'     // НЕТ!
import { Icon } from 'heroicons'       // НЕТ!
import { Icon } from 'lucide-react'    // ДА!
```

### ❌ Inline стили
```tsx
<Icon style={{ width: '20px' }} />  // НЕТ!
```

## Разрешено

### ✅ Системные размеры
```tsx
<Icon className="w-3 h-3" />  // 12px
<Icon className="w-4 h-4" />  // 16px
<Icon className="w-5 h-5" />  // 20px
<Icon className="w-6 h-6" />  // 24px
<Icon className="w-8 h-8" />  // 32px
```

### ✅ Системные stroke
```tsx
<Icon className="stroke-2" />      // Для 16px
<Icon className="stroke-[1.5]" />  // Для 20px+
```

### ✅ Только Lucide
```tsx
import { ShoppingCart, Heart, User } from 'lucide-react'
```

## Соответствие типографике

### text-xs (12px) → w-3 h-3 (12px)
```tsx
<span className="text-xs">
  <Icon className="w-3 h-3 stroke-2" />
  Caption
</span>
```

### text-sm (14px) → w-4 h-4 (16px)
```tsx
<button className="text-sm">
  <Icon className="w-4 h-4 stroke-2" />
  Кнопка
</button>
```

### text-base (16px) → w-5 h-5 (20px)
```tsx
<p className="text-base">
  <Icon className="w-5 h-5 stroke-[1.5]" />
  Текст
</p>
```

### text-xl (20px) → w-6 h-6 (24px)
```tsx
<h4 className="text-xl">
  <Icon className="w-6 h-6 stroke-[1.5]" />
  Заголовок
</h4>
```

## Hover эффекты

### Изменение цвета
```tsx
<button className="group">
  <Icon className="w-4 h-4 stroke-2 text-muted-foreground group-hover:text-accent transition-colors" />
</button>
```

### Анимация
```tsx
<motion.button whileHover={{ scale: 1.05 }}>
  <Icon className="w-4 h-4 stroke-2" />
</motion.button>
```

## Accessibility

### Декоративные иконки
```tsx
<Icon className="w-4 h-4 stroke-2" aria-hidden="true" />
```

### Информативные иконки
```tsx
<Icon className="w-4 h-4 stroke-2" aria-label="Корзина" />
```

## Чеклист

Перед коммитом проверьте:
- [ ] Используются только Lucide иконки
- [ ] Размеры из системы (w-3/4/5/6/8)
- [ ] Правильный stroke (2 для 16px, 1.5 для 20px+)
- [ ] Иконки выровнены с текстом
- [ ] Нет произвольных размеров
- [ ] Нет inline стилей
- [ ] Цвета из системы
- [ ] Добавлен shrink-0 где нужно

## Примеры компонентов

### Footer.tsx ✅
```tsx
<Phone className="w-4 h-4 stroke-2 text-accent" />
<MessageCircle className="w-4 h-4 stroke-2 text-accent" />
<Send className="w-4 h-4 stroke-2 text-accent" />
<Users className="w-4 h-4 stroke-2 text-accent" />
<MapPin className="w-4 h-4 stroke-2 text-muted-foreground" />
```

### Promotions.tsx ✅
```tsx
<ShoppingBag className="w-4 h-4 stroke-2" />
<Clock className="w-3 h-3 stroke-2" />
```

### OptimizedProductList.tsx ✅
```tsx
<Heart className="w-4 h-4" />
<ShoppingCart className="w-4 h-4" />
```

---

**Эта система обязательна для всех иконок в проекте MM05.**
