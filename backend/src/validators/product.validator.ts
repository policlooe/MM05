import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().positive('Price must be positive').max(10000000),
  oldPrice: z.number().positive('Old price must be positive').max(10000000).optional().nullable(),
  assemblyPrice: z.number().positive('Assembly price must be positive').max(10000000).optional().nullable(),
  image: z.string().url('Image must be a valid URL').optional(),
  thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL').optional().nullable(),
  images: z.array(z.string().url('Image must be a valid URL')).optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional().nullable(),
  stock: z.number().int().nonnegative().max(99999).default(0),
  stockQuantity: z.number().int().nonnegative().max(99999).optional(),
  badge: z.string().max(50).optional().nullable(),
  featured: z.boolean().default(false),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

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
