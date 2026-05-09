import { z } from 'zod';

/**
 * Схема валидации для добавления товара в корзину
 */
export const addToCartSchema = z.object({
  productId: z.string().uuid('Некорректный ID товара'),
  quantity: z
    .number()
    .int('Количество должно быть целым числом')
    .positive('Количество должно быть положительным')
    .max(99, 'Максимальное количество: 99'),
});

/**
 * Схема валидации для обновления количества товара в корзине
 */
export const updateCartItemSchema = z.object({
  itemId: z.string().uuid('Некорректный ID элемента корзины'),
  quantity: z
    .number()
    .int('Количество должно быть целым числом')
    .positive('Количество должно быть положительным')
    .max(99, 'Максимальное количество: 99'),
});

/**
 * Схема валидации для параметра ID элемента корзины
 */
export const cartItemIdParamSchema = z.object({
  itemId: z.string().uuid('Некорректный ID элемента корзины'),
});
