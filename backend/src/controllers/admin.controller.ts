import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';
import { paginationSchema } from '../validators/admin.validator.js';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

function normalizeProductData(data: Record<string, any>) {
  const { image, stock, featured, ...rest } = data;

  return {
    ...rest,
    ...(typeof stock !== 'undefined' && typeof rest.stockQuantity === 'undefined'
      ? { stockQuantity: stock }
      : {}),
    ...(typeof featured !== 'undefined' && typeof rest.isFeatured === 'undefined'
      ? { isFeatured: featured }
      : {}),
    ...(image && !rest.thumbnailUrl ? { thumbnailUrl: image } : {}),
    ...(image && !rest.images ? { images: [image] } : {}),
  };
}

export class AdminController {
  /**
   * GET /api/admin/products
   * Получение всех товаров (для админа) с пагинацией
   */
  static async getAllProducts(req: Request, res: Response) {
    try {
      // Валидация параметров пагинации
      const { page, limit } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          include: {
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.product.count(),
      ]);

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch products',
      });
    }
  }

  /**
   * GET /api/admin/products/:id
   * Получение товара по ID для формы редактирования
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch product',
      });
    }
  }

  /**
   * POST /api/admin/products
   * Создание нового товара с валидацией
   */
  static async createProduct(req: Request, res: Response) {
    try {
      // Валидация входных данных
      const validatedData = createProductSchema.parse(req.body);

      // Проверка уникальности slug
      const existingProduct = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'Товар с таким slug уже существует',
        });
      }

      const product = await prisma.product.create({
        data: normalizeProductData(validatedData) as Prisma.ProductUncheckedCreateInput,
        include: {
          category: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create product',
      });
    }
  }

  /**
   * PUT /api/admin/products/:id
   * Обновление товара с валидацией
   */
  static async updateProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // Валидация входных данных
      const validatedData = updateProductSchema.parse(req.body);

      // Если обновляется slug, проверяем уникальность
      if (validatedData.slug) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            slug: validatedData.slug,
            NOT: { id },
          },
        });

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            error: 'Товар с таким slug уже существует',
          });
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: normalizeProductData(validatedData) as Prisma.ProductUncheckedUpdateInput,
        include: {
          category: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update product',
      });
    }
  }

  /**
   * DELETE /api/admin/products/:id
   * Удаление товара
   */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      await prisma.product.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete product',
      });
    }
  }

  /**
   * GET /api/admin/orders
   * Получение всех заказов с пагинацией
   */
  static async getAllOrders(req: Request, res: Response) {
    try {
      // Валидация параметров пагинации
      const { page, limit } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.order.count(),
      ]);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  }

  /**
   * GET /api/admin/orders/:id
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch order',
      });
    }
  }

  /**
   * PUT /api/admin/orders/:id/status
   * Обновление статуса заказа с валидацией
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      // Валидация входных данных
      const { status, adminNote } = updateOrderStatusSchema.parse(req.body);

      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          adminNote,
          ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
          ...(status === 'SHIPPED' && { shippedAt: new Date() }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
        },
        include: {
          user: true,
          items: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update order status',
      });
    }
  }

  /**
   * GET /api/admin/users
   * Получение всех пользователей с пагинацией
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      // Валидация параметров пагинации
      const { page, limit } = paginationSchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                orders: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.user.count(),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users',
      });
    }
  }

  /**
   * GET /api/admin/stats
   * Получение статистики для дашборда
   */
  static async getStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        pendingOrders,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count(),
        prisma.order.count({ where: { status: 'NEW' } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalOrders,
          totalProducts,
          pendingOrders,
          totalRevenue: totalRevenue._sum.total || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch stats',
      });
    }
  }
}
