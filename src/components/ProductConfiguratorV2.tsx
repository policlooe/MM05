// Product Configurator V2 - с использованием Design System
// Полностью на базе UI компонентов

import { useState, useEffect, useMemo } from "react";
import { formatPrice } from "@/store/cart";
import {
  ProductConfiguration,
  SelectedConfiguration,
  calculateConfiguredPrice,
  checkDependencies,
} from "@/types/product-config";
import { getRussianLabel, formatConfigValue } from "@/lib/product-labels";
import { OptionButton, OptionGroup, Toggle, DeliveryOption } from "./ui";

interface ProductConfiguratorV2Props {
  basePrice: number;
  configuration: ProductConfiguration;
  onConfigChange: (config: SelectedConfiguration, finalPrice: number) => void;
  className?: string;
}

export function ProductConfiguratorV2({
  basePrice,
  configuration,
  onConfigChange,
  className,
}: ProductConfiguratorV2Props) {
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
      if (option.type === "toggle") {
        initial.options[option.id] = option.defaultValue || false;
      } else if (option.type === "select") {
        initial.options[option.id] =
          option.defaultValue || option.values[0]?.value || null;
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
    <div className={className}>
      <div className="space-y-3">
        {/* Вариации (цвет, размер, материал) */}
        {configuration.variants?.map((variant) => {
          const russianLabel = getRussianLabel(variant.id);
          const selectedValue = selected.variants[variant.id];
          const selectedOption = variant.options.find(
            (opt) => opt.value === selectedValue
          );

          return (
            <OptionGroup
              key={variant.id}
              title={russianLabel}
              value={
                selectedValue
                  ? formatConfigValue(variant.id, selectedValue)
                  : undefined
              }
              required={variant.required}
            >
              {variant.options.map((option) => {
                const isSelected = selectedValue === option.value;
                const russianOptionLabel = formatConfigValue(
                  variant.id,
                  option.value
                );

                return (
                  <OptionButton
                    key={option.value}
                    selected={isSelected}
                    onClick={() => handleVariantChange(variant.id, option.value)}
                    disabled={option.disabled}
                    price={
                      option.priceModifier !== 0
                        ? `${option.priceModifier > 0 ? "+" : ""}${formatPrice(
                            option.priceModifier
                          )}`
                        : undefined
                    }
                  >
                    {russianOptionLabel}
                  </OptionButton>
                );
              })}
            </OptionGroup>
          );
        })}

        {/* Опции (сборка, доставка и т.д.) */}
        {configuration.options?.map((option) => {
          const isAvailable = checkDependencies(option, selected);
          const russianLabel = getRussianLabel(option.id);

          if (option.type === "toggle") {
            // Расчет цены с учетом зависимостей
            let displayPrice = option.price;
            if (option.dependencies?.variant && option.dependencies.priceModifier) {
              const dependencyMet = Object.entries(
                option.dependencies.variant
              ).every(
                ([variantId, value]) => selected.variants[variantId] === value
              );
              if (dependencyMet) {
                displayPrice += option.dependencies.priceModifier;
              }
            }

            return (
              <Toggle
                key={option.id}
                label={russianLabel}
                price={`+${formatPrice(displayPrice)}`}
                description={option.description}
                checked={selected.options[option.id] as boolean}
                onChange={(value) => handleToggleChange(option.id, value)}
                disabled={!isAvailable}
              />
            );
          } else if (option.type === "select") {
            return (
              <div key={option.id} className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">
                  {russianLabel}
                </h3>
                <div className="space-y-1.5">
                  {option.values.map((value) => {
                    const isSelected = selected.options[option.id] === value.value;
                    const russianValueLabel = getRussianLabel(value.value);

                    return (
                      <DeliveryOption
                        key={value.value}
                        label={russianValueLabel}
                        price={
                          value.price === 0
                            ? "Бесплатно"
                            : `+${formatPrice(value.price)}`
                        }
                        selected={isSelected}
                        onClick={() => handleSelectChange(option.id, value.value)}
                        disabled={!isAvailable || value.disabled}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
