# 🧪 Руководство по тестированию

## Обзор

Проект использует **Vitest** для unit-тестирования и **Testing Library** для тестирования React компонентов.

## Запуск тестов

```bash
# Запустить все тесты один раз
npm run test

# Запустить в watch mode (для разработки)
npm run test:watch

# Запустить с coverage
npm run test -- --coverage
```

## Структура тестов

```
src/
├── lib/
│   ├── analytics.ts
│   └── __tests__/
│       └── analytics.test.ts
├── services/
│   ├── payment.ts
│   └── __tests__/
│       └── payment.test.ts
└── components/
    ├── ContactUs.tsx
    └── __tests__/
        └── ContactUs.test.tsx
```

## Написание тестов

### Unit тесты для утилит

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Тесты для React компонентов

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Мокирование

```typescript
import { vi } from 'vitest';

// Мокирование модуля
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Мокирование функции
const mockFn = vi.fn();
mockFn.mockResolvedValue('result');
```

## Покрытие тестами

### Текущее покрытие

| Модуль | Coverage | Тесты |
|--------|----------|-------|
| `analytics.ts` | 100% | ✅ 8 тестов |
| `payment.ts` | 100% | ✅ 7 тестов |
| `contacts.ts` | 100% | ✅ 6 тестов |

### Цели покрытия

- **Критические модули**: 100% (payment, auth, analytics)
- **UI компоненты**: 80%+
- **Утилиты**: 90%+

## Best Practices

### 1. Тестируйте поведение, а не реализацию

❌ **Плохо:**
```typescript
it('should call setState', () => {
  const component = new MyComponent();
  component.handleClick();
  expect(component.setState).toHaveBeenCalled();
});
```

✅ **Хорошо:**
```typescript
it('should show success message after click', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### 2. Используйте описательные названия

❌ **Плохо:**
```typescript
it('works', () => { ... });
```

✅ **Хорошо:**
```typescript
it('should redirect to checkout when payment is successful', () => { ... });
```

### 3. Arrange-Act-Assert паттерн

```typescript
it('should calculate total correctly', () => {
  // Arrange - подготовка
  const items = [{ price: 100 }, { price: 200 }];
  
  // Act - действие
  const total = calculateTotal(items);
  
  // Assert - проверка
  expect(total).toBe(300);
});
```

### 4. Тестируйте edge cases

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  
  it('should throw error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
  
  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});
```

## Тестирование асинхронного кода

```typescript
it('should fetch data successfully', async () => {
  const mockData = { id: 1, name: 'Test' };
  vi.mocked(api.get).mockResolvedValue({ data: mockData });
  
  const result = await fetchData();
  
  expect(result).toEqual(mockData);
});
```

## Тестирование ошибок

```typescript
it('should handle network errors', async () => {
  const error = new Error('Network error');
  vi.mocked(api.post).mockRejectedValue(error);
  
  await expect(createCheckout()).rejects.toThrow('Network error');
});
```

## CI/CD Integration

Тесты автоматически запускаются в GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Отладка тестов

### Просмотр DOM

```typescript
import { screen, render } from '@testing-library/react';

render(<MyComponent />);
screen.debug(); // Выводит текущий DOM
```

### Использование --ui

```bash
npm run test -- --ui
```

Откроет браузерный интерфейс для отладки тестов.

## Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Обновлено:** 2026-05-26
