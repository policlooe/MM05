import { z } from 'zod';

/**
 * Схема валидации для создания checkout сессии
 */
export const createCheckoutSessionSchema = z.object({
  orderId: z.string().uuid('Некорректный ID заказа'),
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

/**
 * Схема валидации для параметра orderId (статус оплаты заказа)
 */
export const orderIdParamSchema = z.object({
  orderId: z.string().uuid('Некорректный ID заказа'),
});
