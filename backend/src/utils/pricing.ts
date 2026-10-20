/**
 * Серверный расчёт цены сконфигурированного товара.
 *
 * Зеркалит клиентскую логику `calculatePrice` из
 * `src/types/product-configuration.ts` (раздел «Расчёт финальной цены»), но
 * работает защитно: любые некорректные данные из БД или от клиента просто
 * игнорируются (не добавляют модификаторы), а не ломают заказ.
 *
 * ЦЕНА ВСЕГДА считается из данных БД. Данные клиента используются только
 * как указатель на то, КАКИЕ опции выбраны — не откуда брать цены.
 *
 * Поддерживаются обе исторические формы `product.configuration`:
 *
 *   1. Карта (актуальная, совпадает с `ProductConfiguration` во фронтенде):
 *      { variants: { size: { label, options: [{ value, priceModifier }] } },
 *        options:  { headboard: { type: 'select', options: [...] },
 *                    mattress:  { type: 'toggle', price: 15000 } } }
 *
 *   2. Массивы (ранняя схема с `id`):
 *      { variants: [{ id, options: [{ value, priceModifier }] }],
 *        options:  [{ id, type: 'select', values: [{ value, price }] }] }
 *
 * Раньше поддерживалась только форма 2, поэтому конфигурация из формы 1
 * оценивалась по базовой цене: сервер получал сумму меньше клиентской и
 * отклонял заказ («Итоговая сумма заказа не совпадает»).
 */

type Json = unknown;

interface PriceAccumulator {
  total: number;
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
 * Ключ опции «сборка» обрабатывается отдельно в
 * `order.create.controller.ts` (product.assemblyPrice), поэтому здесь он
 * пропускается — иначе цена сборки посчиталась бы дважды.
 */
const SEPARATELY_PRICED_OPTION_KEYS = new Set(['assembly']);

/**
 * Достаёт список значений варианта и добавляет модификатор выбранного.
 * Понимает обе формы: `variant.options` (карта и массивы) и
 * `option.priceModifier` / `option.price`.
 */
function accumulateVariantGroup(
  acc: PriceAccumulator,
  optionsList: Json[] | null,
  selectedValue: string
): void {
  if (!optionsList) return;

  for (const rawOption of optionsList) {
    const option = asRecord(rawOption);
    if (!option) continue;

    if (asString(option.value) !== selectedValue) continue;

    const modifier = asFiniteNumber(option.priceModifier) ?? asFiniteNumber(option.price);
    if (modifier !== null) {
      acc.total += modifier;
    }
    return;
  }
}

function accumulateVariants(acc: PriceAccumulator, def: Record<string, Json>, selected: Record<string, Json>): void {
  const rawVariants = def.variants;
  if (rawVariants === undefined || rawVariants === null) return;

  const selectedVariants = asRecord(selected.variants) ?? {};

  // Форма 2: массив групп с явным id
  const variantArray = asArray(rawVariants);
  if (variantArray) {
    for (const rawVariant of variantArray) {
      const variant = asRecord(rawVariant);
      if (!variant) continue;

      const variantId = asString(variant.id);
      const selectedValue = variantId ? asString(selectedVariants[variantId]) : null;
      if (!selectedValue) continue;

      accumulateVariantGroup(acc, asArray(variant.options), selectedValue);
    }
    return;
  }

  // Форма 1: карта «ключ → группа»
  const variantMap = asRecord(rawVariants);
  if (variantMap) {
    for (const [variantId, rawGroup] of Object.entries(variantMap)) {
      const selectedValue = asString(selectedVariants[variantId]);
      if (!selectedValue) continue;

      const group = asRecord(rawGroup);
      if (!group) continue;

      accumulateVariantGroup(acc, asArray(group.options), selectedValue);
    }
  }
}

function accumulateOptions(acc: PriceAccumulator, def: Record<string, Json>, selected: Record<string, Json>): void {
  const rawOptions = def.options;
  if (rawOptions === undefined || rawOptions === null) return;

  const selectedOptions = asRecord(selected.options) ?? {};

  // Форма 2: массив опций с явным id
  const optionArray = asArray(rawOptions);
  if (optionArray) {
    for (const rawOption of optionArray) {
      const option = asRecord(rawOption);
      if (!option) continue;

      const optionId = asString(option.id);
      if (!optionId || SEPARATELY_PRICED_OPTION_KEYS.has(optionId)) continue;

      if (option.type === 'toggle') {
        if (selectedOptions[optionId] === true) {
          const price = asFiniteNumber(option.price);
          if (price !== null) acc.total += price;
        }
        continue;
      }

      if (option.type === 'select') {
        const selectedValue = asString(selectedOptions[optionId]);
        if (!selectedValue) continue;

        // В форме 2 значения лежат в `values` и используют поле `price`.
        accumulateVariantGroup(acc, asArray(option.values), selectedValue);
      }
    }
    return;
  }

  // Форма 1: карта «ключ → опция»
  const optionMap = asRecord(rawOptions);
  if (!optionMap) return;

  for (const [optionId, rawOption] of Object.entries(optionMap)) {
    if (SEPARATELY_PRICED_OPTION_KEYS.has(optionId)) continue;

    const option = asRecord(rawOption);
    if (!option) continue;

    if (option.type === 'toggle') {
      if (selectedOptions[optionId] === true) {
        const price = asFiniteNumber(option.price);
        if (price !== null) acc.total += price;
      }
      continue;
    }

    if (option.type === 'select') {
      const selectedValue = asString(selectedOptions[optionId]);
      if (!selectedValue) continue;

      // В форме 1 значения лежат в `options` и используют `priceModifier`.
      accumulateVariantGroup(acc, asArray(option.options), selectedValue);
    }
  }
}

/**
 * Расчёт итоговой цены позиции заказа по данным БД.
 *
 * @param basePrice         базовая цена товара из БД (product.price)
 * @param configurationDef  JSON product.configuration из БД (описание вариантов/опций)
 * @param selected          выбранные значения от клиента ({ variants: {...}, options: {...} })
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

  const acc: PriceAccumulator = { total: price };

  accumulateVariants(acc, def, sel);
  accumulateOptions(acc, def, sel);

  price = acc.total;

  // Защита от отрицательных цен при ошибочных данных в БД
  return Math.max(0, Math.round(price * 100) / 100);
}
