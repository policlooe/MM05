import { z } from 'zod';

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
 * Схема валидации для получения статистики
 */
export const statsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});
