# 🏗️ Backend Architecture Documentation

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура базы данных](#структура-базы-данных)
3. [Безопасность (RLS)](#безопасность-rls)
4. [API Reference](#api-reference)
5. [Примеры использования](#примеры-использования)
6. [Развертывание](#развертывание)
7. [Тестирование](#тестирование)

---

## 🎯 Обзор архитектуры

### Технологический стек

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Language**: TypeScript
- **Security**: Row Level Security (RLS)

### Основные компоненты

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Supabase Client (TypeScript)       │
│  ┌─────────┬─────────┬─────────────┐   │
│  │  Auth   │  API    │   Storage   │   │
│  └─────────┴─────────┴─────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Supabase Backend                │
│  ┌──────────────────────────────────┐  │
│  │  PostgreSQL + RLS Policies       │  │
│  │  ┌────────┬────────┬──────────┐  │  │
│  │  │ Users  │Products│  Orders  │  │  │
│  │  └────────┴────────┴──────────┘  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📊 Структура базы данных

### Таблицы

#### 1. **users** (расширение auth.users)
Хранит дополнительную информацию о пользователях.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  default_address JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
);
```

**Роли:**
- `user` - обычный пользователь
- `admin` - администратор

#### 2. **categories**
Категории товаров с поддержкой вложенности.

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### 3. **products**
Товары магазина.

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2), -- только для admin
  images JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  specifications JSONB DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_in_stock BOOLEAN GENERATED,
  low_stock_threshold INTEGER DEFAULT 5,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  badge TEXT,
  sort_order INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id)
);
```

#### 4. **cart_items**
Корзина покупок.

```sql
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_at_add DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, product_id)
);
```

#### 5. **orders**
Заказы клиентов.

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address JSONB NOT NULL,
  customer_note TEXT,
  admin_note TEXT, -- не виден клиенту
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
```

**Статусы заказа:**
- `pending` - Ожидает подтверждения
- `confirmed` - Подтвержден
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменен

**Статусы оплаты:**
- `pending` - Ожидает оплаты
- `paid` - Оплачен
- `failed` - Ошибка оплаты
- `refunded` - Возврат

#### 6. **order_items**
Позиции в заказах.

```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  product_id UUID REFERENCES products(id),
  product_snapshot JSONB NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ
);
```

---

## 🔒 Безопасность (RLS)

### Принципы безопасности

1. **Row Level Security включен на всех таблицах**
2. **Пользователи видят только свои данные**
3. **Администраторы имеют полный доступ**
4. **Валидация на уровне базы данных**
5. **Не доверяем клиенту**

### Политики RLS

#### Users

```sql
-- Пользователи видят только свой профиль
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Пользователи могут обновлять свой профиль (кроме роли)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Администраторы видят всех
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin());
```

#### Products

```sql
-- Все видят активные товары
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR is_admin());

-- Только админы могут создавать/изменять
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (is_admin());
```

#### Cart

```sql
-- Пользователи видят только свою корзину
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут добавлять в свою корзину
CREATE POLICY "Users can add to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Orders

```sql
-- Пользователи видят только свои заказы
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут отменять только pending заказы
CREATE POLICY "Users can cancel own pending orders"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND status IN ('pending', 'cancelled')
  );
```

### Storage Policies

```sql
-- Bucket: products (изображения товаров)
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND is_admin());

-- Bucket: avatars (аватары пользователей)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 📚 API Reference

### Authentication

#### Регистрация
```typescript
import { signUp } from '@/lib/supabase/api/auth';

const { data, error } = await signUp({
  email: 'user@example.com',
  password: 'secure_password',
  fullName: 'Иван Иванов'
});
```

#### Вход
```typescript
import { signIn } from '@/lib/supabase/api/auth';

const { data, error } = await signIn({
  email: 'user@example.com',
  password: 'secure_password'
});
```

#### Выход
```typescript
import { signOut } from '@/lib/supabase/api/auth';

const { error } = await signOut();
```

### Products

#### Получить список товаров
```typescript
import { getProducts } from '@/lib/supabase/api/products';

const { data, count, error } = await getProducts({
  categoryId: 'uuid',
  search: 'кровать',
  minPrice: 10000,
  maxPrice: 50000,
  inStock: true,
  featured: true,
  limit: 20,
  offset: 0,
  sortBy: 'price_asc'
});
```

#### Получить товар по slug
```typescript
import { getProductBySlug } from '@/lib/supabase/api/products';

const { data, error } = await getProductBySlug('krovat-dvuspalnaya');
```

#### Создать товар (admin)
```typescript
import { createProduct } from '@/lib/supabase/api/products';

const { data, error } = await createProduct({
  name: 'Кровать "Комфорт"',
  slug: 'krovat-komfort',
  category_id: 'uuid',
  price: 45000,
  stock_quantity: 10,
  description: 'Описание товара',
  images: ['/path/to/image.jpg'],
  is_active: true
});
```

#### Загрузить изображение
```typescript
import { uploadProductImage } from '@/lib/supabase/api/products';

const file = event.target.files[0];
const { data, error } = await uploadProductImage(file, productId);
// data.url - публичный URL изображения
```

### Cart

#### Получить корзину
```typescript
import { getCart } from '@/lib/supabase/api/cart';

const { data, error } = await getCart();
```

#### Добавить в корзину
```typescript
import { addToCart } from '@/lib/supabase/api/cart';

const { data, error } = await addToCart(productId, quantity);
```

#### Обновить количество
```typescript
import { updateCartItem } from '@/lib/supabase/api/cart';

const { data, error } = await updateCartItem(cartItemId, newQuantity);
```

#### Удалить из корзины
```typescript
import { removeFromCart } from '@/lib/supabase/api/cart';

const { error } = await removeFromCart(cartItemId);
```

#### Очистить корзину
```typescript
import { clearCart } from '@/lib/supabase/api/cart';

const { error } = await clearCart();
```

### Orders

#### Создать заказ
```typescript
import { createOrder } from '@/lib/supabase/api/orders';

const { data, error } = await createOrder({
  customerName: 'Иван Иванов',
  customerEmail: 'ivan@example.com',
  customerPhone: '+79001234567',
  deliveryAddress: {
    city: 'Махачкала',
    street: 'ул. Ленина',
    building: '10',
    apartment: '5'
  },
  items: [
    { productId: 'uuid', quantity: 2, price: 45000 }
  ],
  deliveryCost: 500,
  discount: 0
});
```

#### Получить мои заказы
```typescript
import { getMyOrders } from '@/lib/supabase/api/orders';

const { data, error } = await getMyOrders();
```

#### Отменить заказ
```typescript
import { cancelOrder } from '@/lib/supabase/api/orders';

const { data, error } = await cancelOrder(orderId);
```

#### Обновить статус (admin)
```typescript
import { updateOrderStatus } from '@/lib/supabase/api/orders';

const { data, error } = await updateOrderStatus(orderId, 'confirmed');
```

---

## 💡 Примеры использования

### Пример 1: Регистрация и вход

```typescript
// components/AuthForm.tsx
import { useState } from 'react';
import { signUp, signIn } from '@/lib/supabase/api/auth';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const { data, error } = await signUp({ email, password });
      if (error) {
        alert(error);
      } else {
        alert('Проверьте email для подтверждения');
      }
    } else {
      const { data, error } = await signIn({ email, password });
      if (error) {
        alert(error);
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        required
      />
      <button type="submit">
        {isSignUp ? 'Регистрация' : 'Вход'}
      </button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Уже есть аккаунт?' : 'Создать аккаунт'}
      </button>
    </form>
  );
}
```

### Пример 2: Каталог товаров с фильтрами

```typescript
// pages/Catalog.tsx
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/supabase/api/products';

export function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 100000,
    sortBy: 'created_at'
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getProducts(filters);
    if (data) setProducts(data);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Поиск..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Пример 3: Корзина с real-time обновлениями

```typescript
// components/Cart.tsx
import { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart } from '@/lib/supabase/api/cart';
import { supabase } from '@/lib/supabase/client';

export function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();

    // Real-time подписка на изменения корзины
    const subscription = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items'
        },
        () => {
          loadCart();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCart = async () => {
    const { data } = await getCart();
    if (data) setCart(data);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await updateCartItem(itemId, quantity);
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <h2>Корзина</h2>
      {cart.map((item) => (
        <div key={item.id}>
          <img src={item.product.thumbnail_url} alt={item.product.name} />
          <h3>{item.product.name}</h3>
          <p>{item.product.price} ₽</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleUpdateQuantity(item.id, parseInt(e.target.value))
            }
          />
          <button onClick={() => handleRemove(item.id)}>Удалить</button>
        </div>
      ))}
      <p>Итого: {total.toLocaleString('ru-RU')} ₽</p>
    </div>
  );
}
```

### Пример 4: Оформление заказа

```typescript
// pages/Checkout.tsx
import { useState } from 'react';
import { createOrder } from '@/lib/supabase/api/orders';
import { getCart } from '@/lib/supabase/api/cart';

export function Checkout() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    city: '',
    street: '',
    building: '',
    apartment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Получаем корзину
    const { data: cart } = await getCart();
    if (!cart || cart.length === 0) {
      alert('Корзина пуста');
      return;
    }

    // Формируем заказ
    const items = cart.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const { data, error } = await createOrder({
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      deliveryAddress: {
        city: formData.city,
        street: formData.street,
        building: formData.building,
        apartment: formData.apartment
      },
      items,
      deliveryCost: 500,
      discount: 0
    });

    if (error) {
      alert(error);
    } else {
      alert(`Заказ ${data.order_number} создан!`);
      window.location.href = `/orders/${data.id}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ФИО"
        value={formData.customerName}
        onChange={(e) =>
          setFormData({ ...formData, customerName: e.target.value })
        }
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.customerEmail}
        onChange={(e) =>
          setFormData({ ...formData, customerEmail: e.target.value })
        }
        required
      />
      <input
        type="tel"
        placeholder="Телефон"
        value={formData.customerPhone}
        onChange={(e) =>
          setFormData({ ...formData, customerPhone: e.target.value })
        }
        required
      />
      <input
        type="text"
        placeholder="Город"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Улица"
        value={formData.street}
        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
        required
      />
      <button type="submit">Оформить заказ</button>
    </form>
  );
}
```

---

## 🚀 Развертывание

### 1. Создание проекта Supabase

```bash
# Установка Supabase CLI
npm install -g supabase

# Вход в аккаунт
supabase login

# Инициализация проекта
supabase init

# Создание нового проекта
supabase projects create mm05-furniture-store
```

### 2. Применение миграций

```bash
# Локальная разработка
supabase start
supabase db reset

# Production
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Настройка переменных окружения

Создайте файл `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Создание администратора

```sql
-- После регистрации первого пользователя через UI
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@mm05.ru';
```

### 5. Настройка Storage Buckets

```bash
# Создать buckets через Supabase Dashboard:
# 1. products (public)
# 2. avatars (public)
```

---

## 🧪 Тестирование

### Тестирование RLS политик

```sql
-- Тест 1: Пользователь видит только свои заказы
SET request.jwt.claims.sub = 'user-uuid';
SELECT * FROM public.orders; -- Должен вернуть только заказы пользователя

-- Тест 2: Администратор видит все заказы
SET request.jwt.claims.sub = 'admin-uuid';
SELECT * FROM public.orders; -- Должен вернуть все заказы

-- Тест 3: Пользователь не может изменить роль
UPDATE public.users SET role = 'admin' WHERE id = 'user-uuid';
-- Должно быть запрещено политикой
```

### Тестирование API

```typescript
// tests/api/products.test.ts
import { describe, it, expect } from 'vitest';
import { getProducts, createProduct } from '@/lib/supabase/api/products';

describe('Products API', () => {
  it('should get products list', async () => {
    const { data, error } = await getProducts({ limit: 10 });
    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
  });

  it('should create product as admin', async () => {
    // Требуется авторизация как admin
    const { data, error } = await createProduct({
      name: 'Test Product',
      slug: 'test-product',
      price: 1000,
      stock_quantity: 10
    });
    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
  });
});
```

---

## 📝 Чеклист для production

- [ ] Все миграции применены
- [ ] RLS включен на всех таблицах
- [ ] Storage buckets созданы и настроены
- [ ] Создан администратор
- [ ] Настроены email templates для auth
- [ ] Настроен CORS
- [ ] Добавлены индексы для производительности
- [ ] Настроен мониторинг и логирование
- [ ] Проведено тестирование безопасности
- [ ] Настроены бэкапы базы данных
- [ ] Документация актуальна

---

## 🔗 Полезные ссылки

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Автор**: Senior Fullstack Developer  
**Дата**: 2026-04-29  
**Версия**: 1.0.0
