import { z } from 'zod';

// Схема валидации для создания товара
export const createProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(200, 'Название слишком длинное'),
  slug: z.string().min(1, 'Slug обязателен').max(200, 'Slug слишком длинный').regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().positive('Цена должна быть положительной'),
  oldPrice: z.number().positive().optional().nullable(),
  image: z.string().url('Неверный формат URL изображения'),
  categoryId: z.string().uuid('Неверный формат ID категории'),
  stock: z.number().int().nonnegative('Количество не может быть отрицательным').default(0),
  badge: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

// Схема валидации для обновления товара
export const updateProductSchema = createProductSchema.partial();

// Схема валидации для обновления статуса заказа
export const updateOrderStatusSchema = z.object({
  status: z.enum(['NEW', 'RESERVED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
  adminNote: z.string().max(500, 'Примечание слишком длинное').optional().nullable(),
});

// Схема валидации для пагинации
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
