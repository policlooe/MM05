import { z } from 'zod';

/**
 * Схема валидации для создания checkout сессии
 * (в текущей реализации данные берутся из корзины, но схема готова для расширения)
 */
export const createCheckoutSessionSchema = z.object({
  deliveryAddress: z
    .string()
    .min(10, 'Введите полный адрес доставки')
    .max(500, 'Адрес слишком длинный')
    .optional(),
  deliveryNote: z
    .string()
    .max(1000, 'Комментарий слишком длинный')
    .optional(),
  promoCode: z
    .string()
    .max(50, 'Промокод слишком длинный')
    .optional(),
});
