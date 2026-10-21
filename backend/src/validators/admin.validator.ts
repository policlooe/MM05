import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

/**
 * Схема валидации для параметра ID (универсальная)
 */
export const idParamSchema = z.object({
  id: z.string().uuid('Некорректный ID'),
});

/**
 * Схема валидации для пагинации (универсальная)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Список заказов: пагинация + серверные фильтры.
 * Фильтры на клиенте не масштабируются: при 10k заказов грузить всё нельзя.
 */
export const ordersQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED']).optional(),
});

/**
 * Список товаров: пагинация + поиск по названию/slug, категория, только дефицит.
 */
export const productsQuerySchema = paginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  lowStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

/**
 * Схема валидации для получения статистики
 */
export const statsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});
