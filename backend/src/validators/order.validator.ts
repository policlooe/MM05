import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

/**
 * Схема валидации для создания заказа
 */
export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов'),
  customerPhone: z
    .string()
    .min(10, 'Введите корректный номер телефона')
    .max(20, 'Номер телефона слишком длинный'),
  customerEmail: z
    .string()
    .email('Некорректный email')
    .optional()
    .nullable()
    .or(z.literal('')),
  deliveryAddress: z
    .string()
    .min(10, 'Введите полный адрес доставки')
    .max(500, 'Адрес слишком длинный'),
  customerNote: z
    .string()
    .max(1000, 'Комментарий слишком длинный')
    .optional()
    .nullable()
    .or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Некорректный ID товара'),
        quantity: z
          .number()
          .int('Количество должно быть целым числом')
          .min(1, 'Минимальное количество: 1')
          .max(99, 'Максимальное количество: 99'),
        price: z.number().positive('Цена должна быть положительной'),
        finalPrice: z.number().positive('Итоговая цена должна быть положительной'),
        configuration: z.any().optional(),
        options: z.any().optional(),
      })
    )
    .min(1, 'Корзина пуста'),
  totalPrice: z.number().positive('Общая сумма должна быть положительной'),
  idempotencyKey: z.string().optional(),
});

/**
 * Схема валидации для обновления статуса заказа
 */
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Некорректный статус заказа' }),
  }),
  adminNote: z
    .string()
    .max(500, 'Примечание слишком длинное')
    .optional()
    .nullable()
    .or(z.literal('')),
});

/**
 * Схема валидации для параметра ID заказа
 */
export const orderIdParamSchema = z.object({
  id: z.string().uuid('Некорректный ID заказа'),
});

/**
 * Схема валидации для пагинации заказов
 */
export const orderPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().max(100).optional(),
});
