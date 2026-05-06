# 🎨 Строгая система типографики MM05

## Шрифт
- **Family:** Inter, sans-serif
- **Веса:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Типографическая шкала

### Заголовки
```tsx
// H1 - Главные заголовки страниц
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">

// H2 - Заголовки секций
<h2 className="text-3xl font-semibold tracking-tight">

// H3 - Подзаголовки
<h3 className="text-2xl font-semibold">

// H4 - Мелкие заголовки
<h4 className="text-xl font-semibold">
```

### Текст
```tsx
// Body - Основной текст
<p className="text-base font-normal">

// Small - Мелкий текст
<p className="text-sm font-normal">

// Caption - Подписи, метки
<span className="text-xs tracking-wide">
```

### UI элементы
```tsx
// Кнопки
<button className="text-sm font-medium">

// Badges
<span className="text-xs font-medium">

// Цены
<p className="text-base font-bold">

// Вторичный текст
<p className="text-sm text-muted-foreground">
```

## Правила

### ❌ ЗАПРЕЩЕНО:
1. Произвольные размеры: `text-[17px]`, `text-[10px]`
2. Неразрешенные веса: `font-thin`, `font-light`, `font-extrabold`, `font-black`
3. Неразрешенные размеры: `text-lg`, `text-7xl`, `text-8xl`, `text-9xl`
4. Inline стили для типографики
5. Смешивание разных систем

### ✅ РАЗРЕШЕНО:
- `text-xs` (12px) - caption
- `text-sm` (14px) - small text
- `text-base` (16px) - body
- `text-xl` (20px) - h4
- `text-2xl` (24px) - h3
- `text-3xl` (30px) - h2
- `text-4xl` (36px) - h1
- `text-5xl` (48px) - h1 desktop

- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)

## Визуальная иерархия

### Приоритет 1 - Главное
```tsx
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
  Главный заголовок
</h1>
```

### Приоритет 2 - Важное
```tsx
<h2 className="text-3xl font-semibold tracking-tight">
  Заголовок секции
</h2>
```

### Приоритет 3 - Обычное
```tsx
<p className="text-base font-normal">
  Основной текст
</p>
```

### Приоритет 4 - Вторичное
```tsx
<p className="text-sm text-muted-foreground">
  Вторичная информация
</p>
```

## Читаемость

### Максимальная ширина текста
```tsx
<p className="text-base max-w-2xl">
  Длинный текст для чтения
</p>
```

### Межстрочный интервал
```tsx
<p className="text-base leading-relaxed">
  Текст с увеличенным интервалом
</p>
```

### Tracking (межбуквенное расстояние)
```tsx
// Для заголовков
<h1 className="tracking-tight">

// Для caption
<span className="tracking-wide">
```

## Примеры использования

### Карточка товара
```tsx
<div>
  {/* Цена */}
  <p className="text-base font-bold">30 000 ₽</p>
  
  {/* Старая цена */}
  <p className="text-sm text-muted-foreground line-through">35 000 ₽</p>
  
  {/* Название */}
  <h3 className="text-sm font-medium">Кровать из массива</h3>
  
  {/* Badge */}
  <span className="text-xs font-medium">Новинка</span>
  
  {/* Кнопка */}
  <button className="text-sm font-medium">В корзину</button>
</div>
```

### Страница товара
```tsx
<div>
  {/* Заголовок */}
  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
    Кровать из массива бука
  </h1>
  
  {/* Описание */}
  <p className="text-base font-normal max-w-2xl">
    Качественная кровать из натурального дерева
  </p>
  
  {/* Характеристики */}
  <h2 className="text-2xl font-semibold">Характеристики</h2>
  <p className="text-sm text-muted-foreground">Размер: 160x200 см</p>
</div>
```

### Форма
```tsx
<form>
  {/* Label */}
  <label className="text-sm font-medium">Ваше имя</label>
  
  {/* Input */}
  <input className="text-base" />
  
  {/* Hint */}
  <p className="text-xs text-muted-foreground">Введите полное имя</p>
  
  {/* Error */}
  <p className="text-xs text-destructive">Обязательное поле</p>
  
  {/* Button */}
  <button className="text-sm font-medium">Отправить</button>
</form>
```

## Адаптивность

### Desktop First
```tsx
<h1 className="text-5xl font-bold">
  Заголовок
</h1>
```

### Mobile First
```tsx
<h1 className="text-4xl md:text-5xl font-bold">
  Заголовок
</h1>
```

## Цвета текста

```tsx
// Основной
<p className="text-foreground">

// Вторичный
<p className="text-muted-foreground">

// Акцент
<p className="text-accent">

// Ошибка
<p className="text-destructive">

// Успех
<p className="text-success">
```

## Проверка

### Перед коммитом проверьте:
1. ✅ Нет произвольных размеров `text-[Xpx]`
2. ✅ Нет неразрешенных весов
3. ✅ Соблюдена иерархия
4. ✅ Используется `tracking-tight` для заголовков
5. ✅ Длинный текст имеет `max-w-2xl`
6. ✅ Кнопки используют `text-sm font-medium`

---

**Эта система обязательна для всех компонентов проекта MM05.**
