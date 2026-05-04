// Конфигуратор товара в стиле Ozon/Wildberries
// Компактный, мобильный-first, полностью на русском

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/store/cart";
import {
  ProductConfiguration,
  SelectedConfiguration,
  calculateConfiguredPrice,
  checkDependencies,
  Variant,
  ProductOption,
} from "@/types/product-config";
import { getRussianLabel, formatConfigValue } from "@/lib/product-labels";

interface ProductConfiguratorOzonProps {
  basePrice: number;
  configuration: ProductConfiguration;
  onConfigChange: (config: SelectedConfiguration, finalPrice: number) => void;
  className?: string;
}

export function ProductConfiguratorOzon({
  basePrice,
  configuration,
  onConfigChange,
  className,
}: ProductConfiguratorOzonProps) {
  // Инициализация state с дефолтными значениями
  const [selected, setSelected] = useState<SelectedConfiguration>(() => {
    const initial: SelectedConfiguration = {
      variants: {},
      options: {},
    };

    // Устанавливаем дефолтные значения для вариантов
    configuration.variants?.forEach((variant) => {
      initial.variants[variant.id] = variant.options[0]?.value || null;
    });

    // Устанавливаем дефолтные значения для опций
    configuration.options?.forEach((option) => {
      if (option.type === 'toggle') {
        initial.options[option.id] = option.defaultValue || false;
      } else if (option.type === 'select') {
        initial.options[option.id] = option.defaultValue || option.values[0]?.value || null;
      }
    });

    return initial;
  });

  // Расчет итоговой цены
  const finalPrice = useMemo(() => {
    return calculateConfiguredPrice(basePrice, configuration, selected);
  }, [basePrice, configuration, selected]);

  // Уведомляем родителя об изменениях
  useEffect(() => {
    onConfigChange(selected, finalPrice);
  }, [selected, finalPrice, onConfigChange]);

  // Обработчик изменения варианта
  const handleVariantChange = (variantId: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantId]: value,
      },
    }));
  };

  // Обработчик изменения toggle опции
  const handleToggleChange = (optionId: string, value: boolean) => {
    setSelected((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [optionId]: value,
      },
    }));
  };

  // Обработчик изменения select опции
  const handleSelectChange = (optionId: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [optionId]: value,
      },
    }));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Вариации (цвет, размер, материал) */}
      {configuration.variants?.map((variant) => (
        <VariantSelectorOzon
          key={variant.id}
          variant={variant}
          selected={selected.variants[variant.id]}
          onChange={(value) => handleVariantChange(variant.id, value)}
        />
      ))}

      {/* Опции (сборка, доставка и т.д.) */}
      {configuration.options?.map((option) => {
        const isAvailable = checkDependencies(option, selected);

        if (option.type === 'toggle') {
          return (
            <ToggleOptionOzon
              key={option.id}
              option={option}
              selected={selected.options[option.id] as boolean}
              onChange={(value) => handleToggleChange(option.id, value)}
              disabled={!isAvailable}
              selectedConfig={selected}
            />
          );
        } else if (option.type === 'select') {
          return (
            <SelectOptionOzon
              key={option.id}
              option={option}
              selected={selected.options[option.id] as string}
              onChange={(value) => handleSelectChange(option.id, value)}
              disabled={!isAvailable}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

// Компонент выбора варианта (Ozon style)
function VariantSelectorOzon({
  variant,
  selected,
  onChange,
}: {
  variant: Variant;
  selected: string | null;
  onChange: (value: string) => void;
}) {
  const russianLabel = getRussianLabel(variant.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {russianLabel}
          {variant.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {selected && (
          <span className="text-xs text-muted-foreground">
            {formatConfigValue(variant.id, selected)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {variant.options.map((option) => {
          const isSelected = selected === option.value;
          const isDisabled = option.disabled;
          const russianOptionLabel = formatConfigValue(variant.id, option.value);

          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              className={cn(
                "relative px-2 py-2 rounded-lg border text-xs font-medium transition-all text-left",
                "hover:border-accent/60 active:scale-[0.98]",
                isSelected
                  ? "border-accent bg-accent/5 text-accent shadow-sm"
                  : "border-border bg-background text-foreground",
                isDisabled && "opacity-40 cursor-not-allowed hover:border-border"
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate">{russianOptionLabel}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                )}
              </div>
              {option.priceModifier !== 0 && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {option.priceModifier > 0 ? '+' : ''}
                  {formatPrice(option.priceModifier)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Компонент toggle опции (Ozon style)
function ToggleOptionOzon({
  option,
  selected,
  onChange,
  disabled,
  selectedConfig,
}: {
  option: Extract<ProductOption, { type: 'toggle' }>;
  selected: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  selectedConfig: SelectedConfiguration;
}) {
  // Расчет цены с учетом зависимостей
  let displayPrice = option.price;
  if (option.dependencies?.variant && option.dependencies.priceModifier) {
    const dependencyMet = Object.entries(option.dependencies.variant).every(
      ([variantId, value]) => selectedConfig.variants[variantId] === value
    );
    if (dependencyMet) {
      displayPrice += option.dependencies.priceModifier;
    }
  }

  const russianLabel = getRussianLabel(option.id);

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-all",
        selected ? "border-accent/30 bg-accent/5" : "border-border bg-background",
        disabled && "opacity-40"
      )}
    >
      <label className={cn("flex items-center gap-3", !disabled && "cursor-pointer")}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{russianLabel}</span>
            <span className="text-sm font-semibold text-accent shrink-0">
              +{formatPrice(displayPrice)}
            </span>
          </div>
          {option.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {option.description}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}

// Компонент select опции (Ozon style - radio group)
function SelectOptionOzon({
  option,
  selected,
  onChange,
  disabled,
}: {
  option: Extract<ProductOption, { type: 'select' }>;
  selected: string | null;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const russianLabel = getRussianLabel(option.id);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {russianLabel}
      </label>

      <div className="space-y-1.5">
        {option.values.map((value) => {
          const isSelected = selected === value.value;
          const isDisabled = disabled || value.disabled;
          const russianValueLabel = getRussianLabel(value.value);

          return (
            <button
              key={value.value}
              onClick={() => !isDisabled && onChange(value.value)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-sm",
                "hover:border-accent/60 active:scale-[0.99]",
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-border bg-background",
                isDisabled && "opacity-40 cursor-not-allowed hover:border-border"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    isSelected ? "border-accent" : "border-border"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  )}
                </div>
                <span className={cn("font-medium", isSelected && "text-accent")}>
                  {russianValueLabel}
                </span>
              </div>
              <span className={cn("font-semibold text-sm shrink-0", isSelected ? "text-accent" : "text-muted-foreground")}>
                {value.price === 0 ? "Бесплатно" : `+${formatPrice(value.price)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
