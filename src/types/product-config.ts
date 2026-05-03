// Amazon-level Product Configuration System

export type VariantOption = {
  value: string;
  label: string;
  priceModifier: number;
  image?: string; // Опционально для цветов/материалов
  disabled?: boolean; // Для зависимостей
};

export type Variant = {
  id: string;
  label: string;
  type: 'color' | 'size' | 'material' | 'custom';
  required: boolean;
  options: VariantOption[];
};

export type ToggleOption = {
  id: string;
  label: string;
  description?: string;
  type: 'toggle';
  price: number;
  defaultValue?: boolean;
  dependencies?: {
    variant?: { [key: string]: string }; // Если выбран вариант
    option?: { [key: string]: boolean }; // Если включена опция
    priceModifier?: number; // Изменение цены при зависимости
  };
};

export type SelectOption = {
  id: string;
  label: string;
  description?: string;
  type: 'select';
  values: Array<{
    value: string;
    label: string;
    price: number;
    disabled?: boolean;
  }>;
  defaultValue?: string;
  dependencies?: {
    variant?: { [key: string]: string };
    option?: { [key: string]: boolean };
  };
};

export type ProductOption = ToggleOption | SelectOption;

export type ProductConfiguration = {
  variants?: Variant[];
  options?: ProductOption[];
};

export type SelectedConfiguration = {
  variants: { [key: string]: string | null };
  options: { [key: string]: boolean | string | null };
};

export type ConfiguredProduct = {
  productId: string;
  name: string;
  basePrice: number;
  configuration: SelectedConfiguration;
  finalPrice: number;
  quantity: number;
  image: string;
};

// Utility type для расширенного продукта
export type ConfigurableProduct = {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  configuration?: ProductConfiguration;
};

// Функция расчета итоговой цены
export function calculateConfiguredPrice(
  basePrice: number,
  configuration: ProductConfiguration | undefined,
  selected: SelectedConfiguration
): number {
  if (!configuration) return basePrice;

  let price = basePrice;

  // Добавляем цену вариантов
  if (configuration.variants) {
    configuration.variants.forEach((variant) => {
      const selectedValue = selected.variants[variant.id];
      if (selectedValue) {
        const option = variant.options.find((opt) => opt.value === selectedValue);
        if (option) {
          price += option.priceModifier;
        }
      }
    });
  }

  // Добавляем цену опций
  if (configuration.options) {
    configuration.options.forEach((option) => {
      if (option.type === 'toggle') {
        const isSelected = selected.options[option.id] as boolean;
        if (isSelected) {
          // Проверяем зависимости для изменения цены
          let optionPrice = option.price;
          
          if (option.dependencies?.variant) {
            const dependencyMet = Object.entries(option.dependencies.variant).every(
              ([variantId, value]) => selected.variants[variantId] === value
            );
            if (dependencyMet && option.dependencies.priceModifier) {
              optionPrice += option.dependencies.priceModifier;
            }
          }
          
          price += optionPrice;
        }
      } else if (option.type === 'select') {
        const selectedValue = selected.options[option.id] as string;
        if (selectedValue) {
          const value = option.values.find((v) => v.value === selectedValue);
          if (value) {
            price += value.price;
          }
        }
      }
    });
  }

  return price;
}

// Функция проверки зависимостей
export function checkDependencies(
  option: ProductOption,
  selected: SelectedConfiguration
): boolean {
  if (!option.dependencies) return true;

  // Проверка зависимостей от вариантов
  if (option.dependencies.variant) {
    const variantDependencyMet = Object.entries(option.dependencies.variant).every(
      ([variantId, value]) => selected.variants[variantId] === value
    );
    if (!variantDependencyMet) return false;
  }

  // Проверка зависимостей от других опций
  if (option.dependencies.option) {
    const optionDependencyMet = Object.entries(option.dependencies.option).every(
      ([optionId, value]) => selected.options[optionId] === value
    );
    if (!optionDependencyMet) return false;
  }

  return true;
}

// Функция получения описания конфигурации для отображения
export function getConfigurationSummary(
  configuration: ProductConfiguration | undefined,
  selected: SelectedConfiguration
): string[] {
  if (!configuration) return [];

  const summary: string[] = [];

  // Добавляем выбранные варианты
  if (configuration.variants) {
    configuration.variants.forEach((variant) => {
      const selectedValue = selected.variants[variant.id];
      if (selectedValue) {
        const option = variant.options.find((opt) => opt.value === selectedValue);
        if (option) {
          summary.push(`${variant.label}: ${option.label}`);
        }
      }
    });
  }

  // Добавляем выбранные опции
  if (configuration.options) {
    configuration.options.forEach((option) => {
      if (option.type === 'toggle') {
        const isSelected = selected.options[option.id] as boolean;
        if (isSelected) {
          summary.push(option.label);
        }
      } else if (option.type === 'select') {
        const selectedValue = selected.options[option.id] as string;
        if (selectedValue) {
          const value = option.values.find((v) => v.value === selectedValue);
          if (value) {
            summary.push(`${option.label}: ${value.label}`);
          }
        }
      }
    });
  }

  return summary;
}
