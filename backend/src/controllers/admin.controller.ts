import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';
import { paginationSchema, statsQuerySchema } from '../validators/admin.validator.js';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { safeChangeOrderStatus } from '../services/order-status.service.js';

function normalizeProductData(data: Record<string, unknown>) {
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
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
    } catch (error: unknown) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: нарушение unique-ограничения (slug и т.п.)
        if (error.code === 'P2002') {
          return res.status(400).json({
            success: false,
            error: 'Товар с таким slug уже существует',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Не удалось создать товар: проверьте корректность данных',
        });
      }
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(400).json({
            success: false,
            error: 'Товар с таким slug уже существует',
          });
        }
        if (error.code === 'P2025') {
          return res.status(404).json({
            success: false,
            error: 'Товар не найден',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Не удалось обновить товар: проверьте корректность данных',
        });
      }
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
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
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            success: false,
            error: 'Товар не найден',
          });
        }
        // P2003: товар связан с заказами/корзинами — не удаляем физически
        if (error.code === 'P2003') {
          return res.status(400).json({
            success: false,
            error: 'Товар используется в заказах. Деактивируйте его вместо удаления.',
          });
        }
      }
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
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
    } catch (error: unknown) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
      });
    }
  }

  /**
   * PUT /api/admin/orders/:id/status
   * Обновление статуса заказа — использует общий сервис жизненного цикла
   * (переходы статусов, возврат стока, email), как и PATCH /api/orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const { status, adminNote } = updateOrderStatusSchema.parse(req.body);

      const result = await safeChangeOrderStatus(id, status, adminNote ?? null);

      if (!result.ok) {
        return res.status(result.code).json({
          success: false,
          error: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: result.order,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
      });
    }
  }

  /**
   * GET /api/admin/stats
   * Получение статистики для дашборда с фильтрацией по периоду
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, period } = statsQuerySchema.parse(req.query);

      // Период определяет окно статистики, если не заданы явные даты
      let from = startDate;
      const to = endDate ?? new Date();

      if (!from) {
        from = new Date(to);
        switch (period) {
          case 'day':
            from.setDate(from.getDate() - 1);
            break;
          case 'week':
            from.setDate(from.getDate() - 7);
            break;
          case 'year':
            from.setFullYear(from.getFullYear() - 1);
            break;
          case 'month':
          default:
            from.setMonth(from.getMonth() - 1);
            break;
        }
      }

      const createdAtWindow = { gte: from, lte: to };

      const [
        totalUsers,
        totalOrders,
        totalProducts,
        pendingOrders,
        revenueAggregate,
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: createdAtWindow } }),
        prisma.order.count({ where: { createdAt: createdAtWindow } }),
        prisma.product.count(),
        prisma.order.count({
          where: { status: 'NEW', createdAt: createdAtWindow },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
            paidAt: { not: null },
          },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          period: {
            from: from.toISOString(),
            to: to.toISOString(),
            type: period,
          },
          totalUsers,
          totalOrders,
          totalProducts,
          pendingOrders,
          totalRevenue: revenueAggregate._sum.total || 0,
        },
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }
  }
}
