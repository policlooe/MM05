import { z } from 'zod';

/**
 * Схема валидации для создания товара
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Название обязательно')
    .max(200, 'Название слишком длинное'),
  slug: z
    .string()
    .min(1, 'Slug обязателен')
    .max(200, 'Slug слишком длинный')
    .regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание слишком длинное')
    .optional(),
  shortDescription: z
    .string()
    .max(500, 'Краткое описание слишком длинное')
    .optional(),
  price: z
    .number()
    .positive('Цена должна быть положительной')
    .max(10000000, 'Цена слишком большая'),
  oldPrice: z
    .number()
    .positive('Старая цена должна быть положительной')
    .max(10000000, 'Старая цена слишком большая')
    .optional()
    .nullable(),
  image: z
    .string()
    .url('Неверный формат URL изображения'),
  categoryId: z
    .string()
    .uuid('Неверный формат ID категории'),
  stock: z
    .number()
    .int('Количество должно быть целым числом')
    .nonnegative('Количество не может быть отрицательным')
    .max(99999, 'Количество слишком большое')
    .default(0),
  badge: z
    .string()
    .max(50, 'Badge слишком длинный')
    .optional()
    .nullable(),
  featured: z
    .boolean()
    .default(false),
});

/**
 * Схема валидации для обновления товара
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Схема валидации для параметра ID товара
 */
export const productIdParamSchema = z.object({
  id: z.string().uuid('Некорректный ID товара'),
});

/**
 * Схема валидации для пагинации товаров
 */
export const productPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
