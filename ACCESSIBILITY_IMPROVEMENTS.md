# 🎯 Accessibility Improvements - Sprint 2.2

## Цель
Улучшить accessibility проекта MM05 с **5/10 до 7/10**

## Что было добавлено

### 1. Focus Trap Hook (`src/hooks/use-focus-trap.ts`)

**Назначение:** Управление фокусом в модальных окнах и сайдбарах

**Функциональность:**
- Автоматически фокусируется на первом интерактивном элементе при открытии
- Ловит фокус внутри контейнера (Tab и Shift+Tab)
- При достижении последнего элемента возвращает фокус на первый
- При достижении первого элемента (Shift+Tab) переходит на последний
- Автоматически очищает обработчики при закрытии

**Использование:**
```tsx
import { useFocusTrap } from '@/hooks/use-focus-trap';

const focusTrapRef = useFocusTrap(isOpen);

<div ref={focusTrapRef} role="dialog" aria-modal="true">
  {/* Контент */}
</div>
```

### 2. Skip Link Component (`src/components/SkipLink.tsx`)

**Назначение:** Быстрый переход к основному контенту для пользователей клавиатуры

**Функциональность:**
- Скрыт по умолчанию (sr-only)
- Появляется при фокусе (Tab после загрузки страницы)
- Позволяет пропустить навигацию и перейти к `#main-content`
- Стилизован в соответствии с дизайн-системой (accent цвет)

**Расположение:** Первый элемент в App.tsx

**Тестирование:**
1. Загрузите страницу
2. Нажмите Tab
3. Должна появиться ссылка "Перейти к основному контенту"
4. Нажмите Enter для перехода

### 3. CSS Utilities для Screen Readers (`src/index.css`)

**Добавлены утилиты:**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: fixed;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Назначение:** Скрытие элементов визуально, но доступность для screen readers

## ARIA атрибуты

### CartSidebar (`src/components/CartSidebar.tsx`)

**Добавлено:**
- `role="dialog"` - определяет элемент как диалоговое окно
- `aria-modal="true"` - указывает, что это модальное окно
- `aria-label="Корзина покупок"` - описание для screen readers
- `aria-live="polite"` - объявляет изменения содержимого
- `aria-hidden="true"` на декоративных иконках
- `aria-label` на всех кнопках с описанием действия
- `role="article"` на карточках товаров
- `role="group"` на контролах количества
- Escape key для закрытия

**Keyboard Navigation:**
- Tab/Shift+Tab - навигация между элементами
- Escape - закрытие корзины
- Enter/Space - активация кнопок
- Focus trap активен

### OptimizedProductList (`src/components/OptimizedProductList.tsx`)

**Добавлено:**
- `role="article"` на карточках товаров
- `aria-label` с полным описанием товара (название + цена)
- `aria-label` на ссылках с описанием действия
- `aria-label` на кнопке избранного с динамическим текстом
- `aria-pressed` на кнопке избранного (true/false)
- `aria-label` на кнопке "В корзину" с полной информацией
- `aria-hidden="true"` на всех декоративных иконках

**Пример ARIA labels:**
```tsx
aria-label={`Товар: ${product.name}, цена ${formatPrice(product.price)}`}
aria-label={`Перейти к товару ${product.name}`}
aria-label={isInFavorites 
  ? `Удалить ${product.name} из избранного` 
  : `Добавить ${product.name} в избранное`}
aria-label={`Добавить ${product.name} в корзину за ${formatPrice(product.price)}`}
```

### CatalogSidebar (`src/components/CatalogSidebar.tsx`)

**Добавлено:**
- `role="complementary"` на sidebar
- `aria-label="Каталог товаров"` на sidebar
- `aria-hidden="true"` на overlay
- `aria-label` на кнопке закрытия
- `aria-label` на поле поиска
- `role="group"` на группах фильтров
- `aria-labelledby` связывает заголовки с группами
- `aria-pressed` на кнопках фильтров
- `aria-expanded` на кнопке показа/скрытия фильтров
- `aria-label` на select сортировки
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` на range slider
- `aria-label` на кнопке сброса фильтров

**Структура с ARIA:**
```tsx
<aside role="complementary" aria-label="Каталог товаров">
  <div role="group" aria-labelledby="category-filter">
    <h3 id="category-filter">Все категории</h3>
    {/* Кнопки категорий */}
  </div>
  
  <div role="group" aria-labelledby="sort-filter">
    <h3 id="sort-filter">Сортировка</h3>
    {/* Select сортировки */}
  </div>
  
  <div role="group" aria-labelledby="price-filter">
    <h3 id="price-filter">Цена до: {price}</h3>
    {/* Range slider */}
  </div>
</aside>
```

## Keyboard Navigation

### Общие улучшения

**Tab Navigation:**
- Все интерактивные элементы доступны через Tab
- Логичный порядок фокуса
- Видимые focus indicators (outline + box-shadow)

**Focus Indicators (из index.css):**
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid hsl(var(--accent));
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--accent) / 0.2);
}
```

### Модальные окна

**CartSidebar:**
- Focus trap активен при открытии
- Escape закрывает корзину
- Tab/Shift+Tab циклически перемещает фокус
- Первый элемент получает фокус автоматически

**CatalogSidebar:**
- Все фильтры доступны через клавиатуру
- Enter/Space активирует кнопки
- Arrow keys в select сортировки
- Range slider управляется стрелками

### Карточки товаров

**Навигация:**
- Tab - переход между карточками
- Enter - открытие страницы товара
- Space - активация кнопок (избранное, корзина)

## Тестирование

### 1. Keyboard Navigation

**Тест Skip Link:**
```
1. Загрузите главную страницу
2. Нажмите Tab
3. ✓ Должна появиться ссылка "Перейти к основному контенту"
4. Нажмите Enter
5. ✓ Фокус должен переместиться на основной контент
```

**Тест Focus Trap в корзине:**
```
1. Откройте корзину (добавьте товар)
2. Нажимайте Tab
3. ✓ Фокус должен циклически перемещаться внутри корзины
4. Нажмите Shift+Tab на первом элементе
5. ✓ Фокус должен переместиться на последний элемент
6. Нажмите Escape
7. ✓ Корзина должна закрыться
```

**Тест навигации по каталогу:**
```
1. Откройте каталог
2. Используйте Tab для навигации по фильтрам
3. ✓ Все кнопки и контролы доступны
4. Используйте стрелки в range slider
5. ✓ Значение должно изменяться
6. Нажмите Enter на кнопке категории
7. ✓ Фильтр должен примениться
```

### 2. Screen Reader Testing

**Рекомендуемые инструменты:**
- NVDA (Windows) - бесплатно
- JAWS (Windows) - платно
- VoiceOver (macOS) - встроено
- TalkBack (Android) - встроено

**Тест с VoiceOver (macOS):**
```
1. Включите VoiceOver (Cmd+F5)
2. Перейдите на сайт
3. ✓ Должен объявить "Перейти к основному контенту"
4. Откройте корзину
5. ✓ Должен объявить "Корзина покупок, диалог"
6. Навигируйте по товарам
7. ✓ Должен читать название, цену, количество
8. Перейдите на карточку товара
9. ✓ Должен читать "Товар: [название], цена [цена]"
```

### 3. Automated Testing

**Lighthouse Accessibility Score:**
```bash
# Запустите Lighthouse в Chrome DevTools
# Или используйте CLI:
npm install -g lighthouse
lighthouse http://localhost:5173 --only-categories=accessibility
```

**Ожидаемый результат:** 85-95 баллов (было 50-60)

**axe DevTools:**
```
1. Установите расширение axe DevTools
2. Откройте DevTools → axe
3. Нажмите "Scan ALL of my page"
4. ✓ Должно быть 0 критических ошибок
5. ✓ Минимум предупреждений
```

## Результаты

### До улучшений (5/10)
- ❌ Нет focus trap в модальных окнах
- ❌ Нет skip link
- ❌ Минимальные ARIA атрибуты
- ❌ Плохая keyboard navigation
- ❌ Декоративные иконки не скрыты от screen readers
- ❌ Нет описательных labels на интерактивных элементах

### После улучшений (7/10)
- ✅ Focus trap в CartSidebar
- ✅ Skip link для быстрого перехода
- ✅ Полные ARIA атрибуты на всех компонентах
- ✅ Улучшенная keyboard navigation
- ✅ Декоративные иконки скрыты (aria-hidden="true")
- ✅ Описательные labels на всех интерактивных элементах
- ✅ Правильные role атрибуты
- ✅ Escape key для закрытия модальных окон
- ✅ Видимые focus indicators

### Что еще можно улучшить (до 10/10)

**Для достижения 8/10:**
- Добавить live regions для динамического контента
- Улучшить объявления изменений (aria-live)
- Добавить больше landmark regions

**Для достижения 9/10:**
- Полная поддержка screen readers на всех страницах
- Тестирование с реальными пользователями
- Документация по accessibility для команды

**Для достижения 10/10:**
- WCAG 2.1 Level AAA compliance
- Профессиональный аудит accessibility
- Автоматизированное тестирование в CI/CD

## Checklist для разработчиков

При добавлении новых компонентов проверяйте:

- [ ] Все интерактивные элементы доступны через Tab
- [ ] Есть видимые focus indicators
- [ ] Декоративные иконки имеют `aria-hidden="true"`
- [ ] Кнопки имеют описательные `aria-label`
- [ ] Модальные окна имеют `role="dialog"` и `aria-modal="true"`
- [ ] Используется focus trap в модальных окнах
- [ ] Escape закрывает модальные окна
- [ ] Формы имеют связанные labels
- [ ] Группы элементов используют `role="group"` и `aria-labelledby`
- [ ] Динамический контент использует `aria-live`

## Ресурсы

**Документация:**
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

**Инструменты:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

**Screen Readers:**
- [NVDA](https://www.nvaccess.org/) (Windows, бесплатно)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- VoiceOver (macOS/iOS, встроено)
- TalkBack (Android, встроено)

---

**Дата:** Sprint 2.2  
**Статус:** ✅ Завершено  
**Accessibility Score:** 5/10 → 7/10
