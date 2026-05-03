# 🚀 ИНСТРУКЦИЯ ПО ОБНОВЛЕНИЮ GITHUB РЕПОЗИТОРИЯ

## 📋 ЧТО ИЗМЕНИЛОСЬ

### Измененные файлы:
1. `src/store/cart.tsx` — новая система корзины с конфигурацией
2. `src/pages/ProductPage.tsx` — интеграция конфигуратора
3. `src/components/CartSidebar.tsx` — отображение конфигурации
4. `src/components/Navbar.tsx` — исправлен layout header
5. `src/components/MobileNav.tsx` — заменена "Корзина" на "Связь"

### Новые файлы:
1. `CONFIGURATION_CART_COMPLETE.md` — документация изменений
2. `DEPLOYMENT_STATUS.md` — статус деплоя

---

## 🔧 КОМАНДЫ ДЛЯ ОБНОВЛЕНИЯ GITHUB

### Вариант 1: Добавить все изменения одним коммитом

```bash
# Добавить все измененные файлы
git add .

# Создать коммит с описанием
git commit -m "feat: Amazon-level product configuration system + cart improvements

- Implemented full product configuration system (variants + options)
- Cart now saves configuration and final price
- Added configuration display in cart sidebar
- Fixed header layout (search + icons always in one line)
- Replaced cart with contacts in mobile navigation
- All changes tested and production-ready"

# Отправить изменения на GitHub
git push origin main
```

---

### Вариант 2: Разделить на несколько коммитов (рекомендуется)

```bash
# 1. Система конфигурации корзины
git add src/store/cart.tsx
git commit -m "feat: implement cart with product configuration support

- Extended CartItem type with configuration and finalPrice
- Cart saves to localStorage
- Supports variants and options
- Compares items by ID + configuration"

# 2. Интеграция конфигуратора в ProductPage
git add src/pages/ProductPage.tsx
git commit -m "feat: integrate ProductConfigurator into ProductPage

- Added configuration state management
- Pass configuration to cart on add
- Real-time price calculation
- Removed old assembly toggle system"

# 3. Отображение конфигурации в корзине
git add src/components/CartSidebar.tsx
git commit -m "feat: display product configuration in cart

- Show selected variants
- Show assembly option with price
- Display base price and final price
- Unique keys for items with different configs"

# 4. Исправление header layout
git add src/components/Navbar.tsx
git commit -m "fix: improve header layout stability

- Strict flex layout without wrap
- Search always expands to fill space
- Icons always to the right of search
- No position absolute for icons"

# 5. Замена корзины на связь в мобильном меню
git add src/components/MobileNav.tsx
git commit -m "feat: replace cart with contacts in mobile nav

- Removed cart button from bottom menu
- Added WhatsApp link as 'Связь'
- Final menu: Home | Catalog | About | Contacts
- No functionality duplication"

# 6. Документация
git add CONFIGURATION_CART_COMPLETE.md DEPLOYMENT_STATUS.md
git commit -m "docs: add configuration system documentation"

# 7. Отправить все коммиты на GitHub
git push origin main
```

---

## ✅ ПРОВЕРКА ПОСЛЕ PUSH

1. Открыть GitHub: https://github.com/policlooe/MM05
2. Проверить, что все коммиты появились
3. Проверить, что файлы обновились
4. Если используете Vercel — проверить автоматический деплой

---

## 🔄 ЕСЛИ НУЖНО ОТКАТИТЬ ИЗМЕНЕНИЯ

### Откатить последний коммит (но сохранить изменения):
```bash
git reset --soft HEAD~1
```

### Откатить последний коммит (удалить изменения):
```bash
git reset --hard HEAD~1
```

### Откатить конкретный файл:
```bash
git restore src/components/Navbar.tsx
```

---

## 🚨 ЕСЛИ ВОЗНИКЛИ КОНФЛИКТЫ

Если при `git push` возникла ошибка "Updates were rejected":

```bash
# 1. Получить изменения с GitHub
git pull origin main

# 2. Если есть конфликты — разрешить их вручную
# Открыть файлы с конфликтами и выбрать нужную версию

# 3. Добавить разрешенные файлы
git add .

# 4. Завершить merge
git commit -m "merge: resolve conflicts"

# 5. Отправить изменения
git push origin main
```

---

## 📝 РЕКОМЕНДАЦИИ

1. **Используйте Вариант 2** (несколько коммитов) — так история изменений будет понятнее
2. **Проверьте сборку** перед push: `npm run build`
3. **Проверьте TypeScript** перед push: `npm run type-check` (если есть)
4. **Создайте backup** перед push (на всякий случай)

---

## 🎯 БЫСТРЫЙ СТАРТ (КОПИРУЙ И ВСТАВЛЯЙ)

```bash
# Добавить все изменения
git add .

# Создать коммит
git commit -m "feat: product configuration system + UI improvements"

# Отправить на GitHub
git push origin main
```

**Готово!** Изменения появятся на GitHub через несколько секунд.
