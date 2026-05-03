import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

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
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: products,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      });
    }
  }

  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id: id as string },
        include: { category: true },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
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
        error: error instanceof Error ? error.message : 'Failed to create product',
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
        error: error instanceof Error ? error.message : 'Failed to update product',
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
        error: error instanceof Error ? error.message : 'Failed to delete product',
      });
    }
  }
}
