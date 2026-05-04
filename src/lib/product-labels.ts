// Словарь русификации для конфигурации товаров
// Используется для замены технических английских значений на человекочитаемые русские

export const VARIANT_LABELS: Record<string, string> = {
  // Размеры
  size: 'Размер',
  '140x200': '140×200 см',
  '160x200': '160×200 см',
  '180x200': '180×200 см',
  
  // Цвета
  color: 'Цвет',
  natural: 'Натуральный дуб',
  dark: 'Темный орех',
  white: 'Белый',
  wenge: 'Венге',
  oak: 'Дуб',
  walnut: 'Орех',
  
  // Изголовье
  headboard: 'Изголовье',
  standard: 'Стандартное',
  soft: 'Мягкое (ткань)',
  leather: 'Мягкое (кожа)',
  none: 'Без изголовья',
  
  // Материалы
  material: 'Материал',
  ldsp: 'ЛДСП',
  mdf: 'МДФ',
  wood: 'Массив',
  
  // Опции
  assembly: 'Сборка мебели',
  mattress: 'Добавить матрас',
  delivery: 'Доставка и подъем',
  
  // Варианты доставки
  pickup: 'Самовывоз',
  delivery_city: 'Доставка по городу',
  floor_1_5: 'Доставка + подъем до 5 этажа',
  floor_6_plus: 'Доставка + подъем выше 5 этажа',
};

// Функция получения русского названия
export function getRussianLabel(key: string): string {
  return VARIANT_LABELS[key] || key;
}

// Функция форматирования значения конфигурации
export function formatConfigValue(variantId: string, value: string): string {
  // Специальная обработка для размеров
  if (variantId === 'size') {
    return value.replace('x', '×') + ' см';
  }
  
  return getRussianLabel(value);
}
