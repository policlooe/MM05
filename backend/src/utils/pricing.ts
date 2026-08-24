/**
 * Серверный расчёт цены сконфигурированного товара.
 *
 * Зеркалит клиентскую логику src/types/product-config.ts (calculateConfiguredPrice),
 * но работает защитно: любые некорректные данные из БД или от клиента
 * просто игнорируются (не добавляют модификаторы), а не ломают заказ.
 *
 * ЦЕНА ВСЕГДА считается из данных БД. Данные клиента используются только
 * как указатель на то, КАКАЕ опции выбраны — не откуда брать цены.
 */

type Json = unknown;

interface VariantOptionDef {
  value?: unknown;
  priceModifier?: unknown;
}

interface VariantDef {
  id?: unknown;
  options?: unknown;
}

interface ToggleOptionDef {
  id?: unknown;
  type?: unknown;
  price?: unknown;
  dependencies?: {
    variant?: unknown;
    priceModifier?: unknown;
  } | null;
}

interface SelectValueDef {
  value?: unknown;
  price?: unknown;
}

interface SelectOptionDef {
  id?: unknown;
  type?: unknown;
  values?: unknown;
}

function asRecord(value: Json): Record<string, Json> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : null;
}

function asArray(value: Json): Json[] | null {
  return Array.isArray(value) ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Расчёт итоговой цены позиции заказа по данным БД.
 *
 * @param basePrice      базовая цена товара из БД (product.price)
 * @param configurationDef JSON product.configuration из БD (описание вариантов/опций)
 * @param selected       выбранные значения от клиента ({ variants: {...}, options: {...} })
 * @returns итоговая цена за единицу товара
 */
export function calculateServerItemPrice(
  basePrice: number,
  configurationDef: Json,
  selected: Json
): number {
  let price = basePrice;

  const def = asRecord(configurationDef);
  const sel = asRecord(selected);

  if (!def || !sel) {
    return price;
  }

  const selectedVariants = asRecord(sel.variants) ?? {};
  const selectedOptions = asRecord(sel.options) ?? {};

  // Варианты (размер/цвет/материал): цена = base + priceModifier выбранного значения
  const variants = asArray(def.variants);
  if (variants) {
    for (const rawVariant of variants) {
      const variant = asRecord(rawVariant) as VariantDef | null;
      if (!variant) continue;

      const variantId = asString(variant.id);
      if (!variantId) continue;

      const selectedValue = asString(selectedVariants[variantId]);
      if (!selectedValue) continue;

      const optionList = asArray(variant.options);
      if (!optionList) continue;

      for (const rawOption of optionList) {
        const option = asRecord(rawOption) as VariantOptionDef | null;
        if (!option) continue;

        if (asString(option.value) === selectedValue) {
          const modifier = asFiniteNumber(option.priceModifier);
          if (modifier !== null) {
            price += modifier;
          }
          break;
        }
      }
    }
  }

  // Опции (toggle: доп. услуги; select: выбор значения с ценой)
  const options = asArray(def.options);
  if (options) {
    for (const rawOption of options) {
      const option = asRecord(rawOption) as ToggleOptionDef & SelectOptionDef;
      if (!option) continue;

      const optionId = asString(option.id);
      if (!optionId) continue;

      if (option.type === 'toggle') {
        // Считаем цену только если опция явно включена пользователем
        if (selectedOptions[optionId] === true) {
          const optionPrice = asFiniteNumber(option.price);
          if (optionPrice !== null) {
            price += optionPrice;
          }

          // Зависимость от варианта (зеркалим клиентскую логику calculateConfiguredPrice)
          const deps = asRecord(option.dependencies ?? null);
          if (deps) {
            const variantDeps = asRecord(deps.variant ?? null);
            const depModifier = asFiniteNumber(deps.priceModifier);

            if (variantDeps && depModifier !== null) {
              const depMet = Object.entries(variantDeps).every(
                ([depVariantId, depValue]) => selectedVariants[depVariantId] === depValue
              );
              if (depMet) {
                price += depModifier;
              }
            }
          }
        }
      } else if (option.type === 'select') {
        const selectedValue = asString(selectedOptions[optionId]);
        if (!selectedValue) continue;

        const valueList = asArray(option.values);
        if (!valueList) continue;

        for (const rawValue of valueList) {
          const valueDef = asRecord(rawValue) as SelectValueDef | null;
          if (!valueDef) continue;

          if (asString(valueDef.value) === selectedValue) {
            const valuePrice = asFiniteNumber(valueDef.price);
            if (valuePrice !== null) {
              price += valuePrice;
            }
            break;
          }
        }
      }
    }
  }

  // Защита от отрицательных цен при ошибочных данных в БД
  return Math.max(0, Math.round(price * 100) / 100);
}
