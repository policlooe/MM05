import { z } from 'zod';

/**
 * Схема валидации для создания checkout сессии
 */
export const createCheckoutSessionSchema = z.object({
  orderId: z.string().uuid('Некорректный ID заказа').optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Некорректный ID товара'),
        quantity: z
          .number()
          .int('Количество должно быть целым числом')
          .positive('Количество должно быть положительным')
          .max(99, 'Максимальное количество: 99'),
        price: z.number().positive('Цена должна быть положительной'),
      })
    )
    .min(1, 'Список товаров не может быть пустым')
    .optional(),
  successUrl: z.string().url('Некорректный URL успеха').optional(),
  cancelUrl: z.string().url('Некорректный URL отмены').optional(),
});

/**
 * Схема валидации для параметра sessionId
 */
export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1, 'Session ID обязателен'),
});

/**
 * Схема валидации для создания возврата
 */
export const createRefundSchema = z.object({
  orderId: z.string().uuid('Некорректный ID заказа'),
  amount: z.number().positive('Сумма возврата должна быть положительной').optional(),
  reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer', 'other'])
    .default('requested_by_customer'),
  description: z.string().max(500, 'Описание слишком длинное').optional(),
});
