import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info } from "lucide-react";
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

interface ProductConfiguratorProps {
  basePrice: number;
  configuration: ProductConfiguration;
  onConfigChange: (config: SelectedConfiguration, finalPrice: number) => void;
  className?: string;
}

export function ProductConfigurator({
  basePrice,
  configuration,
  onConfigChange,
  className,
}: ProductConfiguratorProps) {
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
    <div className={cn("space-y-6", className)}>
      {/* Вариации (цвет, размер, материал) */}
      {configuration.variants?.map((variant) => (
        <VariantSelector
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
            <ToggleOptionSelector
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
            <SelectOptionSelector
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

      {/* Итоговая цена */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-xl p-4"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Итоговая цена:</span>
          <motion.span
            key={finalPrice}
            initial={{ scale: 1.1, color: "hsl(var(--accent))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            transition={{ duration: 0.3 }}
            className="font-serif text-2xl md:text-3xl font-semibold"
          >
            {formatPrice(finalPrice)}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент выбора варианта
function VariantSelector({
  variant,
  selected,
  onChange,
}: {
  variant: Variant;
  selected: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">
          {variant.label}
          {variant.required && <span className="text-destructive ml-1">*</span>}
        </label>
        {selected && (
          <span className="text-xs text-muted-foreground">
            {variant.options.find((opt) => opt.value === selected)?.label}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {variant.options.map((option) => {
          const isSelected = selected === option.value;
          const isDisabled = option.disabled;

          return (
            <motion.button
              key={option.value}
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={cn(
                "relative px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium",
                isSelected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-foreground hover:border-accent/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.image && (
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 inline-block">
                  <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                </div>
              )}
              {option.label}
              {option.priceModifier !== 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {option.priceModifier > 0 ? '+' : ''}
                  {formatPrice(option.priceModifier)}
                </span>
              )}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Компонент toggle опции
function ToggleOptionSelector({
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: disabled ? 0.5 : 1, y: 0 }}
      className={cn(
        "bg-surface border border-border rounded-xl p-4 transition-all",
        selected && "border-accent/30 bg-accent/5",
        disabled && "cursor-not-allowed"
      )}
    >
      <label className={cn("flex items-start gap-3", !disabled && "cursor-pointer")}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <div className="w-11 h-6 bg-secondary rounded-full peer-checked:bg-accent transition-colors border border-border peer-checked:border-accent"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{option.label}</span>
            <span className="font-semibold text-sm text-accent">
              +{formatPrice(displayPrice)}
            </span>
          </div>
          {option.description && (
            <p className="text-xs text-muted-foreground">{option.description}</p>
          )}
          {disabled && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Недоступно для текущей конфигурации</span>
            </div>
          )}
        </div>
      </label>
    </motion.div>
  );
}

// Компонент select опции
function SelectOptionSelector({
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
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold flex items-center gap-2">
        {option.label}
        {option.description && (
          <span className="text-xs text-muted-foreground font-normal">
            ({option.description})
          </span>
        )}
      </label>

      <div className="space-y-2">
        {option.values.map((value) => {
          const isSelected = selected === value.value;
          const isDisabled = disabled || value.disabled;

          return (
            <motion.button
              key={value.value}
              onClick={() => !isDisabled && onChange(value.value)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.99 } : {}}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-sm",
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-accent/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected ? "border-accent bg-accent" : "border-border"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("font-medium", isSelected && "text-accent")}>
                  {value.label}
                </span>
              </div>
              <span className={cn("font-semibold", isSelected ? "text-accent" : "text-muted-foreground")}>
                {value.price === 0 ? "Бесплатно" : `+${formatPrice(value.price)}`}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
