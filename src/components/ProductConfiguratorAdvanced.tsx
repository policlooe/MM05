/**
 * Расширенный конфигуратор товаров
 * Поддерживает варианты с изображениями и все типы опций
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/store/cart";
import {
  ProductConfiguration,
  SelectedConfiguration,
  calculatePrice,
  initializeConfiguration,
  getImageForColor,
} from "@/types/product-configuration";

interface ProductConfiguratorAdvancedProps {
  basePrice: number;
  configuration: ProductConfiguration;
  defaultImage: string;
  onConfigChange: (config: SelectedConfiguration, price: number) => void;
  onImageChange?: (imageUrl: string) => void;
  className?: string;
}

export function ProductConfiguratorAdvanced({
  basePrice,
  configuration,
  defaultImage,
  onConfigChange,
  onImageChange,
  className,
}: ProductConfiguratorAdvancedProps) {
  // Инициализация с дефолтными значениями
  const [selected, setSelected] = useState<SelectedConfiguration>(() =>
    initializeConfiguration(configuration)
  );

  // Обновляем родителя при изменении конфигурации
  useEffect(() => {
    const { finalPrice } = calculatePrice(basePrice, configuration, selected);
    onConfigChange(selected, finalPrice);

    // Обновляем изображение при изменении цвета
    if (selected.variants.color && onImageChange) {
      const newImage = getImageForColor(configuration, selected.variants.color, defaultImage);
      onImageChange(newImage);
    }
  }, [selected, basePrice, configuration, defaultImage, onConfigChange, onImageChange]);

  // Обработчик изменения варианта
  const handleVariantChange = (groupKey: string, value: string) => {
    setSelected(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [groupKey]: value,
      },
    }));
  };

  // Обработчик изменения toggle опции
  const handleToggleChange = (optionKey: string, value: boolean) => {
    setSelected(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value,
      },
    }));
  };

  // Обработчик изменения select опции
  const handleSelectChange = (optionKey: string, value: string) => {
    setSelected(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value,
      },
    }));
  };

  const priceCalc = calculatePrice(basePrice, configuration, selected);

  return (
    <div className={cn("space-y-3", className)}>
      {/* ВАРИАНТЫ (размер, цвет) */}
      {configuration.variants && Object.entries(configuration.variants).map(([key, group]) => (
        <div key={key} className="bg-white border border-border rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">
              {group.label}
              {group.required && <span className="text-accent ml-1">*</span>}
            </h3>
            {selected.variants[key] && (
              <span className="text-xs text-muted-foreground">
                {group.options.find(opt => opt.value === selected.variants[key])?.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {group.options.map(option => {
              const isSelected = selected.variants[key] === option.value;
              const isDisabled = option.disabled;

              return (
                <motion.button
                  key={option.value}
                  onClick={() => !isDisabled && handleVariantChange(key, option.value)}
                  disabled={isDisabled}
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                  className={cn(
                    "relative px-3 py-2 rounded-lg border text-sm transition-all text-left",
                    "flex flex-col gap-1",
                    isSelected
                      ? "border-accent bg-accent/5 text-accent"
                      : isDisabled
                      ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                      : "border-border bg-white hover:border-accent/40"
                  )}
                >
                  <span className="font-medium truncate">{option.label}</span>
                  {option.priceModifier !== 0 && (
                    <span className={cn(
                      "text-xs font-semibold",
                      isSelected ? "text-accent" : "text-muted-foreground"
                    )}>
                      {option.priceModifier > 0 ? '+' : ''}{formatPrice(option.priceModifier)}
                    </span>
                  )}

                  {/* Чекмарк для выбранного */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Превью изображения для цветов */}
                  {key === 'color' && option.image && (
                    <div className="mt-1 w-full h-12 rounded overflow-hidden border border-border/50">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ОПЦИИ (изголовье, матрас, доставка) */}
      {configuration.options && Object.entries(configuration.options).map(([key, option]) => {
        if (option.type === 'toggle') {
          const isChecked = selected.options[key] === true;
          const isDisabled = option.disabled;

          return (
            <div key={key} className="bg-white border border-border rounded-lg p-3">
              <label
                className={cn(
                  "flex items-start gap-3 cursor-pointer",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => !isDisabled && handleToggleChange(key, e.target.checked)}
                  disabled={isDisabled}
                  className="mt-0.5 w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-sm font-bold text-accent shrink-0">
                      +{formatPrice(option.price)}
                    </span>
                  </div>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  )}
                  {isDisabled && option.disabledMessage && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {option.disabledMessage}
                    </p>
                  )}
                </div>
              </label>
            </div>
          );
        }

        if (option.type === 'select') {
          const selectedValue = selected.options[key] as string;

          return (
            <div key={key} className="bg-white border border-border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">
                  {option.label}
                  {option.required && <span className="text-accent ml-1">*</span>}
                </h3>
                {selectedValue && (
                  <span className="text-xs text-muted-foreground">
                    {option.options.find(opt => opt.value === selectedValue)?.label}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {option.options.map(selectOption => {
                  const isSelected = selectedValue === selectOption.value;
                  const isDisabled = selectOption.disabled;

                  return (
                    <motion.button
                      key={selectOption.value}
                      onClick={() => !isDisabled && handleSelectChange(key, selectOption.value)}
                      disabled={isDisabled}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all",
                        isSelected
                          ? "border-accent bg-accent/5"
                          : isDisabled
                          ? "border-border bg-muted/30 cursor-not-allowed opacity-50"
                          : "border-border hover:border-accent/40"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-accent" : "text-foreground"
                      )}>
                        {selectOption.label}
                      </span>
                      <span className={cn(
                        "text-sm font-semibold",
                        isSelected ? "text-accent" : "text-muted-foreground"
                      )}>
                        {selectOption.priceModifier === 0
                          ? "Бесплатно"
                          : `${selectOption.priceModifier > 0 ? '+' : ''}${formatPrice(selectOption.priceModifier)}`
                        }
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* ИТОГОВАЯ ЦЕНА */}
      {priceCalc.breakdown.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2">Детализация цены</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Базовая цена</span>
              <span className="font-medium">{formatPrice(priceCalc.basePrice)}</span>
            </div>
            {priceCalc.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.label}: {item.value}
                </span>
                <span className={cn(
                  "font-medium",
                  item.price > 0 ? "text-accent" : "text-green-600"
                )}>
                  {item.price > 0 ? '+' : ''}{formatPrice(item.price)}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border flex justify-between">
              <span className="font-semibold">Итого</span>
              <span className="font-bold text-accent text-base">
                {formatPrice(priceCalc.finalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
