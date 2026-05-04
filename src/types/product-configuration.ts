/**
 * Расширенная система конфигурации товаров
 * Поддерживает варианты с изображениями и дополнительные опции
 */

export interface VariantOption {
  value: string;
  label: string;
  priceModifier: number;
  image?: string;
  default?: boolean;
  disabled?: boolean;
}

export interface VariantGroup {
  label: string;
  required: boolean;
  options: VariantOption[];
}

export interface ToggleOption {
  label: string;
  type: 'toggle';
  price: number;
  description?: string;
  default?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

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

export type ProductOption = ToggleOption | SelectOption;

export interface ProductConfiguration {
  variants?: {
    [key: string]: VariantGroup;
  };
  options?: {
    [key: string]: ProductOption;
  };
}

export interface SelectedConfiguration {
  variants: {
    [key: string]: string;
  };
  options: {
    [key: string]: string | boolean;
  };
}

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
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  let variantsTotal = 0;
  let optionsTotal = 0;
  const breakdown: Array<{ label: string; value: string; price: number }> = [];

  // 1. Рассчитываем цену вариантов (variants)
  if (configuration.variants) {
    Object.entries(configuration.variants).forEach(([key, group]) => {
      const selectedValue = selected.variants[key];
      if (selectedValue) {
        const option = group.options.find(opt => opt.value === selectedValue);
        // Добавляем к итоговой сумме, если есть модификатор цены
        if (option && option.priceModifier) {
          variantsTotal += option.priceModifier;
          breakdown.push({
            label: group.label,
            value: option.label,
            price: option.priceModifier
          });
        }
      }
    });
  }

  // 2. Рассчитываем цену опций (options)
  if (configuration.options) {
    Object.entries(configuration.options).forEach(([key, optionConfig]) => {
      const selectedValue = selected.options[key];

      // Логика для чекбоксов (toggle)
      if (optionConfig.type === 'toggle' && selectedValue === true) {
        optionsTotal += optionConfig.price;
        breakdown.push({
          label: optionConfig.label,
          value: 'Да',
          price: optionConfig.price
        });
      } 
      // Логика для списков (select)
      else if (optionConfig.type === 'select' && typeof selectedValue === 'string') {
        const option = optionConfig.options.find(opt => opt.value === selectedValue);
        if (option && option.priceModifier) {
          optionsTotal += option.priceModifier;
          breakdown.push({
            label: optionConfig.label,
            value: option.label,
            price: option.priceModifier
          });
        }
      }
    });
  }

  return {
    basePrice,
    variantsTotal,
    optionsTotal,
    finalPrice: basePrice + variantsTotal + optionsTotal,
    breakdown
  };
}
