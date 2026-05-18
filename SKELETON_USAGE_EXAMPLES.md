# 🎨 Skeleton Screens — Примеры использования

## 📋 Быстрый старт

### Импорт компонентов

```tsx
// Все skeleton компоненты
import { 
  ProductCardSkeleton, 
  ProductListSkeleton, 
  HeroSkeleton,
  CatalogSidebarSkeleton 
} from '@/components/skeletons';

// Базовый Skeleton
import { Skeleton } from '@/components/ui/skeleton';
```

## 🎯 Примеры использования

### 1. Skeleton для карточки товара

```tsx
import { ProductCardSkeleton } from '@/components/skeletons';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ProductCardSkeleton />;
  }

  return <ProductCard product={product} />;
}
```

**Результат:**
```
┌─────────────────┐
│                 │
│   ░░░░░░░░░░    │ ← Skeleton изображения
│   ░░░░░░░░░░    │
│                 │
├─────────────────┤
│ ░░░░            │ ← Skeleton цены
│ ░░░░░░░░░░░░    │ ← Skeleton названия
│ ░░░░░░░░        │
│                 │
│ ░░░░░░░░░░░░    │ ← Skeleton кнопки
└─────────────────┘
```

### 2. Skeleton для списка товаров

```tsx
import { ProductListSkeleton } from '@/components/skeletons';

function ProductsSection() {
  const { data, isLoading } = useQuery('products');

  if (isLoading) {
    return <ProductListSkeleton count={8} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Параметры:**
- `count` — количество skeleton карточек (по умолчанию 6)

**Результат:**
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│░░░░│ │░░░░│ │░░░░│ │░░░░│
│░░░░│ │░░░░│ │░░░░│ │░░░░│
└────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│░░░░│ │░░░░│ │░░░░│ │░░░░│
│░░░░│ │░░░░│ │░░░░│ │░░░░│
└────┘ └────┘ └────┘ └────┘
```

### 3. Skeleton для Hero баннера

```tsx
import { HeroSkeleton } from '@/components/skeletons';
import { Suspense, lazy } from 'react';

const Hero = lazy(() => import('./Hero'));

function HomePage() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <Hero />
    </Suspense>
  );
}
```

**Результат:**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         ░░░░░░░░░░░░░░░░░░░░            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 4. Skeleton для боковой панели

```tsx
import { CatalogSidebarSkeleton } from '@/components/skeletons';

function CatalogPage() {
  const [filtersLoading, setFiltersLoading] = useState(true);

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <aside>
        {filtersLoading ? (
          <CatalogSidebarSkeleton />
        ) : (
          <Filters />
        )}
      </aside>
      <main>
        <ProductList />
      </main>
    </div>
  );
}
```

**Результат:**
```
┌──────────────┐
│ ░░░░░░░░░░░░ │ ← Поиск
│              │
│ ░░░░         │ ← Заголовок
│ ░░░░░░░░░░░░ │ ← Фильтр 1
│ ░░░░░░░░░░░░ │ ← Фильтр 2
│ ░░░░░░░░░░░░ │ ← Фильтр 3
│ ░░░░░░░░░░░░ │ ← Фильтр 4
│ ░░░░░░░░░░░░ │ ← Фильтр 5
└──────────────┘
```

### 5. Базовый Skeleton для кастомных компонентов

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function CustomSkeleton() {
  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <Skeleton className="h-8 w-48 rounded-lg" />
      
      {/* Параграф */}
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
      
      {/* Кнопка */}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
```

**Результат:**
```
░░░░░░░░░░░░

░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░

░░░░░░░░░░
```

## 🎨 Продвинутые примеры

### Skeleton с Suspense (рекомендуется)

```tsx
import { Suspense, lazy } from 'react';
import { ProductListSkeleton } from '@/components/skeletons';

const Products = lazy(() => import('./Products'));

function App() {
  return (
    <Suspense fallback={<ProductListSkeleton count={8} />}>
      <Products />
    </Suspense>
  );
}
```

### Skeleton с условным рендерингом

```tsx
function ProductList() {
  const { data, isLoading, error } = useQuery('products');

  if (isLoading) {
    return <ProductListSkeleton count={12} />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Skeleton с постепенной загрузкой

```tsx
function ProductList() {
  const [visibleCount, setVisibleCount] = useState(8);
  const { data, isLoading } = useQuery('products');

  if (isLoading) {
    return <ProductListSkeleton count={visibleCount} />;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {data.slice(0, visibleCount).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {visibleCount < data.length && (
        <button onClick={() => setVisibleCount(prev => prev + 8)}>
          Показать еще
        </button>
      )}
    </>
  );
}
```

### Skeleton для секции с заголовком

```tsx
function ProductsSection() {
  const { data, isLoading } = useQuery('products');

  return (
    <section className="bg-surface-alt py-8 md:py-12">
      <div className="container-x">
        <h2 className="text-3xl font-semibold tracking-tight mb-6">
          Популярные товары
        </h2>
        
        {isLoading ? (
          <ProductListSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

## 🎯 Кастомные Skeleton компоненты

### Skeleton для формы

```tsx
function FormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Label + Input */}
      <div>
        <Skeleton className="h-4 w-24 mb-2 rounded" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      
      {/* Label + Input */}
      <div>
        <Skeleton className="h-4 w-32 mb-2 rounded" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      
      {/* Textarea */}
      <div>
        <Skeleton className="h-4 w-28 mb-2 rounded" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      
      {/* Button */}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
```

### Skeleton для таблицы

```tsx
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      
      {/* Rows */}
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
```

### Skeleton для профиля

```tsx
function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <Skeleton className="w-16 h-16 rounded-full shrink-0" />
      
      <div className="flex-1 space-y-2">
        {/* Name */}
        <Skeleton className="h-6 w-48 rounded" />
        
        {/* Bio */}
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        
        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}
```

## 📱 Адаптивные Skeleton

### Skeleton с разным количеством на разных экранах

```tsx
function ResponsiveProductList() {
  const { data, isLoading } = useQuery('products');

  if (isLoading) {
    return (
      <>
        {/* Mobile: 4 карточки */}
        <div className="md:hidden">
          <ProductListSkeleton count={4} />
        </div>
        
        {/* Tablet: 6 карточек */}
        <div className="hidden md:block lg:hidden">
          <ProductListSkeleton count={6} />
        </div>
        
        {/* Desktop: 8 карточек */}
        <div className="hidden lg:block">
          <ProductListSkeleton count={8} />
        </div>
      </>
    );
  }

  return <ProductGrid products={data} />;
}
```

## 🎨 Стилизация Skeleton

### Кастомные цвета

```tsx
<Skeleton className="bg-gray-200" />
<Skeleton className="bg-blue-100" />
<Skeleton className="bg-accent/20" />
```

### Кастомные размеры

```tsx
{/* Маленький */}
<Skeleton className="h-3 w-16 rounded" />

{/* Средний */}
<Skeleton className="h-4 w-24 rounded" />

{/* Большой */}
<Skeleton className="h-6 w-32 rounded-lg" />

{/* Очень большой */}
<Skeleton className="h-10 w-48 rounded-xl" />
```

### Кастомные скругления

```tsx
<Skeleton className="rounded-none" />    {/* Без скругления */}
<Skeleton className="rounded-sm" />      {/* Маленькое */}
<Skeleton className="rounded-md" />      {/* Среднее */}
<Skeleton className="rounded-lg" />      {/* Большое */}
<Skeleton className="rounded-xl" />      {/* Очень большое */}
<Skeleton className="rounded-full" />    {/* Круглое */}
```

## ⚡ Оптимизация производительности

### Мемоизация Skeleton компонентов

```tsx
import { memo } from 'react';

const MemoizedProductListSkeleton = memo(ProductListSkeleton);

function MyComponent() {
  return <MemoizedProductListSkeleton count={8} />;
}
```

### Ленивая загрузка Skeleton

```tsx
import { lazy, Suspense } from 'react';

const HeavySkeleton = lazy(() => import('./HeavySkeleton'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading skeleton...</div>}>
      <HeavySkeleton />
    </Suspense>
  );
}
```

## 🎯 Best Practices

### ✅ Правильно

```tsx
// Skeleton повторяет структуру реального компонента
<ProductCardSkeleton />

// Используется с Suspense
<Suspense fallback={<ProductListSkeleton count={8} />}>
  <Products />
</Suspense>

// Правильное количество skeleton элементов
<ProductListSkeleton count={8} /> // 8 товаров на странице
```

### ❌ Неправильно

```tsx
// Skeleton не соответствует реальному компоненту
<div className="h-20 w-20 bg-gray-200" />

// Слишком много skeleton элементов
<ProductListSkeleton count={100} /> // Слишком много!

// Skeleton без анимации
<div className="bg-gray-200 h-10 w-full" /> // Нет shimmer
```

## 📊 Метрики

### Когда использовать Skeleton

- ✅ Загрузка данных с сервера (> 200ms)
- ✅ Lazy loading компонентов
- ✅ Асинхронные операции
- ✅ Переходы между страницами

### Когда НЕ использовать Skeleton

- ❌ Мгновенные операции (< 100ms)
- ❌ Синхронные операции
- ❌ Статический контент
- ❌ Уже загруженные данные

---

**Документация:** SKELETON_SCREENS_COMPLETE.md  
**Примеры:** SKELETON_USAGE_EXAMPLES.md  
**Сводка:** SPRINT_2.3_SUMMARY.md
