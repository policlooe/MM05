import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { productPaginationSchema } from '../validators/product.validator.js';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  oldPrice: z.number().positive().optional().nullable(),
  image: z.string().url(),
  categoryId: z.string().uuid(),
  stockQuantity: z.number().int().nonnegative().default(0),
  badge: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export class ProductController {
  static async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      // Публичный каталог: пагинация + фильтры + сортировка (query уже провалидирован роутом)
      const q = productPaginationSchema.parse(req.query);

      const where: Prisma.ProductWhereInput = {
        isActive: true,
        ...(q.category ? { categoryId: q.category } : {}),
        ...(q.featured !== undefined ? { isFeatured: q.featured } : {}),
        ...(q.inStock !== undefined ? { stockQuantity: q.inStock ? { gt: 0 } : { lte: 0 } } : {}),
        ...((q.minPrice !== undefined || q.maxPrice !== undefined)
          ? { price: { gte: q.minPrice ?? undefined, lte: q.maxPrice ?? undefined } }
          : {}),
        ...(q.search
          ? {
              OR: [
                { name: { contains: q.search, mode: 'insensitive' } },
                { shortDescription: { contains: q.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { [q.sortBy]: q.sortOrder },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        success: true,
        data: products,
        pagination: {
          page: q.page,
          limit: q.limit,
          total,
          totalPages: Math.ceil(total / q.limit),
        },
      });
    } catch (error: unknown) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
      });
    }
  }

  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');

      const product = await prisma.product.findFirst({
        // Публичная выдача: только активные товары (по id ИЛИ slug)
        where: { isActive: true, OR: [{ id }, { slug: id }] },
        include: { category: true },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      // Счётчик просмотров — асинхронно, не блокирует ответ
      void prisma.product
        .update({ where: { id: product.id }, data: { viewsCount: { increment: 1 } } })
        .catch(() => undefined);

      res.json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
      });
    }
  }

  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = productSchema.parse(req.body);

      const existingProduct = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingProduct) {
        res.status(400).json({
          success: false,
          error: 'Product with this slug already exists',
        });
        return;
      }

      const product = await prisma.product.create({
        data: validatedData,
        include: { category: true },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create product',
      });
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = productSchema.partial().parse(req.body);

      if (validatedData.slug) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            slug: validatedData.slug,
            NOT: { id: id as string },
          },
        });

        if (existingProduct) {
          res.status(400).json({
            success: false,
            error: 'Product with this slug already exists',
          });
          return;
        }
      }

      const product = await prisma.product.update({
        where: { id: id as string },
        data: validatedData,
        include: { category: true },
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update product',
      });
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.product.delete({
        where: { id: id as string },
      });

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
      });
    }
  }
}
