/**
 * Расширенная система конфигурации товаров
 * Поддерживает варианты с изображениями и дополнительные опции
 */

// Опция варианта (размер, цвет и т.д.)
export interface VariantOption {
  value: string;
  label: string;
  priceModifier: number; // Изменение цены (может быть отрицательным)
  image?: string; // URL изображения для этого варианта (для цветов)
  default?: boolean; // Вариант по умолчанию
  disabled?: boolean; // Недоступен для выбора
}

// Группа вариантов (размер, цвет)
export interface VariantGroup {
  label: string;
  required: boolean;
  options: VariantOption[];
}

// Опция toggle (вкл/выкл)
export interface ToggleOption {
  label: string;
  type: 'toggle';
  price: number;
  description?: string;
  default?: boolean;
  disabled?: boolean;
  disabledMessage?: string; // Сообщение почему недоступно
}

// Опция select (выбор из списка)
export interface SelectOption {
  label: string;
  type: 'select';
  required?: boolean;
  options: Array<{
    value: string;
    label: string;
    priceModifier: number;
    default?: boolean;
    disabled?: boolean;
  }>;
}

// Все типы опций
export type ProductOption = ToggleOption | SelectOption;

// Полная конфигурация товара
export interface ProductConfiguration {
  variants?: {
    [key: string]: VariantGroup; // size, color, etc.
  };
  options?: {
    [key: string]: ProductOption; // headboard, mattress, delivery, etc.
  };
}

// Выбранная конфигурация пользователя
export interface SelectedConfiguration {
  variants: {
    [key: string]: string; // { size: "160x200", color: "natural" }
  };
  options: {
    [key: string]: string | boolean; // { headboard: "soft-fabric", mattress: true, delivery: "city" }
  };
}

// Результат расчета цены
export interface PriceCalculation {
  basePrice: number;
  variantsTotal: number;
  optionsTotal: number;
  finalPrice: number;
  breakdown: Array<{
    label: string;
    value: string;
    price: number;
  }>;
}

/**
 * Рассчитывает финальную цену на основе выбранной конфигурации
 * @param basePrice - базовая цена товара
 * @param configuration - конфигурация товара
 * @param selected - выбранная пользователем конфигурация
 * @returns объект с детализацией цены
 */
export function calculatePrice(
  basePrice: number,
  configuration: ProductConfiguration,
  selected: SelectedConfiguration
): PriceCalculation {
  // Валидация входных данных
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  let variantsTotal = 0;
  let optionsTotal = 0;
  const breakdown: Array<{ label: string; value: string; price: number }> = [];

  // Рассчитываем цену вариантов
  if (configuration.variants) {
    Object.entries(configuration.variants).forEach(([key, group]) => {
      const selectedValue = selected.variants[key];
      if (selectedValue) {
        const option = group.options.find(opt => opt.value === selectedValue);
        if (option && option.priceModifier !== 0) {
          variantsTotal += option.priceModifier;
          breakdown.push({
            label: group.label,
            value: option.label,
            price: option.priceModifier,
          });
        }
      }
    });
  }

  // Рассчитываем цену опций
  if (configuration.options) {
    Object.entries(configuration.options).forEach(([key, option]) => {
      if (option.type === 'toggle') {
        const isSelected = selected.options[key] === true;
        if (isSelected && option.price >= 0) {
          optionsTotal += option.price;
          breakdown.push({
            label: option.label,
            value: 'Да',
            price: option.price,
          });
        }
      } else if (option.type === 'select') {
        const selectedValue = selected.options[key] as string;
        if (selectedValue) {
          const selectedOption = option.options.find(opt => opt.value === selectedValue);
          if (selectedOption && selectedOption.priceModifier !== 0) {
            optionsTotal += selectedOption.priceModifier;
            breakdown.push({
              label: option.label,
              value: selectedOption.label,
              price: selectedOption.priceModifier,
            });
          }
        }
      }
    });
  }

  const finalPrice = basePrice + variantsTotal + optionsTotal;

  return {
    basePrice,
    variantsTotal,
    optionsTotal,
    finalPrice: Math.max(0, finalPrice), // Защита от отрицательной цены
    breakdown,
  };
}

/**
 * Получает изображение для выбранного цвета
 */
export function getImageForColor(
  configuration: ProductConfiguration,
  selectedColor: string,
  defaultImage: string
): string {
  if (!configuration.variants?.color) {
    return defaultImage;
  }

  const colorOption = configuration.variants.color.options.find(
    opt => opt.value === selectedColor
  );

  return colorOption?.image || defaultImage;
}

/**
 * Инициализирует конфигурацию значениями по умолчанию
 */
export function initializeConfiguration(
  configuration: ProductConfiguration
): SelectedConfiguration {
  const selected: SelectedConfiguration = {
    variants: {},
    options: {},
  };

  // Устанавливаем варианты по умолчанию
  if (configuration.variants) {
    Object.entries(configuration.variants).forEach(([key, group]) => {
      const defaultOption = group.options.find(opt => opt.default);
      if (defaultOption) {
        selected.variants[key] = defaultOption.value;
      } else if (group.options.length > 0) {
        selected.variants[key] = group.options[0].value;
      }
    });
  }

  // Устанавливаем опции по умолчанию
  if (configuration.options) {
    Object.entries(configuration.options).forEach(([key, option]) => {
      if (option.type === 'toggle') {
        selected.options[key] = option.default || false;
      } else if (option.type === 'select') {
        const defaultOption = option.options.find(opt => opt.default);
        if (defaultOption) {
          selected.options[key] = defaultOption.value;
        } else if (option.options.length > 0) {
          selected.options[key] = option.options[0].value;
        }
      }
    });
  }

  return selected;
}

/**
 * Проверяет, заполнены ли все обязательные поля
 */
export function validateConfiguration(
  configuration: ProductConfiguration,
  selected: SelectedConfiguration
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Проверяем обязательные варианты
  if (configuration.variants) {
    Object.entries(configuration.variants).forEach(([key, group]) => {
      if (group.required && !selected.variants[key]) {
        errors.push(`Выберите ${group.label.toLowerCase()}`);
      }
    });
  }

  // Проверяем обязательные опции
  if (configuration.options) {
    Object.entries(configuration.options).forEach(([key, option]) => {
      if (option.type === 'select' && option.required && !selected.options[key]) {
        errors.push(`Выберите ${option.label.toLowerCase()}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
