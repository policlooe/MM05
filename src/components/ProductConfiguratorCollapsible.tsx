/**
 * Сворачиваемый конфигуратор товаров
 * Каждая секция (варианты, опции) может быть свернута/развернута
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/store/cart";
import {
  ProductConfiguration,
  SelectedConfiguration,
  calculatePrice,
  initializeConfiguration,
  getImageForColor,
} from "@/types/product-configuration";

interface ProductConfiguratorCollapsibleProps {
  basePrice: number;
  configuration: ProductConfiguration;
  defaultImage: string;
  onConfigChange: (config: SelectedConfiguration, price: number) => void;
  onImageChange?: (imageUrl: string) => void;
  className?: string;
}

export function ProductConfiguratorCollapsible({
  basePrice,
  configuration,
  defaultImage,
  onConfigChange,
  onImageChange,
  className,
}: ProductConfiguratorCollapsibleProps) {
  // Инициализация с дефолтными значениями
  const [selected, setSelected] = useState<SelectedConfiguration>(() =>
    initializeConfiguration(configuration)
  );

  // Мастер-коллапс для всего конфигуратора
  const [isMasterExpanded, setIsMasterExpanded] = useState(false);

  // Состояние для сворачивания секций
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    // По умолчанию все секции СВЕРНУТЫ (false)
    if (configuration.variants) {
      Object.keys(configuration.variants).forEach(key => {
        initial[`variant-${key}`] = false;
      });
    }
    if (configuration.options) {
      Object.keys(configuration.options).forEach(key => {
        initial[`option-${key}`] = false;
      });
    }
    // Детализация цены тоже свернута
    initial['price-details'] = false;
    return initial;
  });

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

  // Переключение секции
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

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
      {/* МАСТЕР-БЛОК: Дополнительные опции */}
      <div className="bg-white border border-border/60 rounded-xl overflow-hidden hover:shadow-sm transition shadow-sm">
        {/* Заголовок мастер-блока */}
        <button
          onClick={() => setIsMasterExpanded(!isMasterExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/5 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
              Дополнительные опции
            </h3>
            <p className="text-xs text-muted-foreground">
              Настройте товар под свои потребности
            </p>
          </div>
          <motion.div
            animate={{ rotate: isMasterExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground group-hover:text-accent transition-colors ml-3"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Содержимое мастер-блока */}
        <AnimatePresence initial={false}>
          {isMasterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* ВАРИАНТЫ (размер, цвет) */}
                {configuration.variants && Object.entries(configuration.variants).map(([key, group]) => {
        const sectionKey = `variant-${key}`;
        const isExpanded = expandedSections[sectionKey];
        const selectedValue = selected.variants[key];
        const selectedOption = group.options.find(opt => opt.value === selectedValue);

        return (
          <div key={key} className="bg-white border border-border/60 rounded-lg overflow-hidden hover:shadow-sm transition-colors">
            {/* Заголовок секции */}
            <button
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  {group.label}
                  {group.required && <span className="text-accent ml-1">*</span>}
                </h3>
                {selectedOption && !isExpanded && (
                  <span className="text-xs text-muted-foreground truncate">
                    — {selectedOption.label}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground group-hover:text-accent transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Содержимое секции */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                              "relative px-4 py-3 rounded-lg border text-sm transition text-left",
                              "flex flex-col gap-1.5 min-h-[60px]",
                              isSelected
                                ? "border-accent bg-accent/10 text-accent shadow-sm"
                                : isDisabled
                                ? "border-border/50 bg-muted/20 text-muted-foreground cursor-not-allowed opacity-50"
                                : "border-border/60 bg-white hover:bg-accent/5"
                            )}
                          >
                            <span className="font-medium text-sm leading-tight break-words">{option.label}</span>
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
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.6, opacity: 0 }}
                                  transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white stroke-[2.5]" />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Превью изображения для цветов */}
                            {key === 'color' && option.image && (
                              <div className="mt-1.5 w-full h-16 sm:h-12 rounded overflow-hidden border border-border/50">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* ОПЦИИ (toggle и select) */}
      {configuration.options && Object.entries(configuration.options).map(([key, option]) => {
        const sectionKey = `option-${key}`;
        const isExpanded = expandedSections[sectionKey];

        if (option.type === 'toggle') {
          const isChecked = selected.options[key] === true;
          const isDisabled = option.disabled;

          return (
            <div key={key} className="bg-white border border-border/60 rounded-lg overflow-hidden hover:shadow-sm transition-colors">
              {/* Заголовок секции */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{option.label}</h3>
                  {isChecked && !isExpanded && (
                    <span className="text-xs text-accent font-semibold">
                      +{formatPrice(option.price)}
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground group-hover:text-accent transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Содержимое секции */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2">
                      <motion.button
                        onClick={() => !isDisabled && handleToggleChange(key, !isChecked)}
                        disabled={isDisabled}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        className={cn(
                          "w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 px-4 py-3 rounded-lg border text-sm transition text-left",
                          isChecked
                            ? "border-accent bg-accent/10 shadow-sm"
                            : isDisabled
                            ? "border-border/50 bg-muted/20 cursor-not-allowed opacity-50"
                            : "border-border/60 hover:bg-accent/5"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "font-medium leading-tight block mb-1",
                            isChecked ? "text-accent" : "text-foreground"
                          )}>
                            {option.label}
                          </span>
                          {option.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {option.description}
                            </p>
                          )}
                          {isDisabled && option.disabledMessage && (
                            <p className="text-xs text-orange-600 mt-1.5 flex items-start gap-1">
                              <Info className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{option.disabledMessage}</span>
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-semibold shrink-0",
                          isChecked ? "text-accent" : "text-muted-foreground"
                        )}>
                          +{formatPrice(option.price)}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        if (option.type === 'select') {
          const selectedValue = selected.options[key] as string;
          const selectedOption = option.options.find(opt => opt.value === selectedValue);

          return (
            <div key={key} className="bg-white border border-border/60 rounded-lg overflow-hidden hover:shadow-sm transition-colors">
              {/* Заголовок секции */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/5 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {option.label}
                    {option.required && <span className="text-accent ml-1">*</span>}
                  </h3>
                  {selectedOption && !isExpanded && (
                    <span className="text-xs text-muted-foreground truncate">
                      — {selectedOption.label}
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground group-hover:text-accent transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Содержимое секции */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-2">
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
                              "w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 px-4 py-3 rounded-lg border text-sm transition text-left",
                              isSelected
                                ? "border-accent bg-accent/10 shadow-sm"
                                : isDisabled
                                ? "border-border/50 bg-muted/20 cursor-not-allowed opacity-50"
                                : "border-border/60 hover:bg-accent/5"
                            )}
                          >
                            <span className={cn(
                              "font-medium leading-tight",
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return null;
      })}

      {/* ИТОГОВАЯ ЦЕНА */}
      {priceCalc.breakdown.length > 0 && (
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-4 mt-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Итоговая стоимость</h3>
            <button
              onClick={() => {
                const detailsExpanded = expandedSections['price-details'];
                setExpandedSections(prev => ({
                  ...prev,
                  'price-details': !detailsExpanded,
                }));
              }}
              className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
            >
              {expandedSections['price-details'] ? 'Скрыть детали' : 'Показать детали'}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {expandedSections['price-details'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-3"
              >
                <div className="space-y-2 text-xs pt-2 border-t border-border">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Базовая цена</span>
                    <span className="font-medium">{formatPrice(priceCalc.basePrice)}</span>
                  </div>
                  {priceCalc.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <span className="text-muted-foreground leading-tight flex-1">
                        {item.label}: {item.value}
                      </span>
                      <span className={cn(
                        "font-medium shrink-0",
                        item.price > 0 ? "text-accent" : "text-green-600"
                      )}>
                        {item.price > 0 ? '+' : ''}{formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center pt-2 border-t border-accent/20">
            <span className="font-semibold text-sm text-foreground">Всего:</span>
            <span className="font-bold text-accent text-2xl">
              {formatPrice(priceCalc.finalPrice)}
            </span>
          </div>
        </div>
      )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ИТОГОВАЯ ЦЕНА ВНЕ МАСТЕР-БЛОКА (всегда видна) */}
      <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-4 sticky bottom-0 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm text-foreground">Итоговая стоимость:</span>
          <span className="font-bold text-accent text-2xl">
            {formatPrice(priceCalc.finalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
