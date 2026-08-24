import { Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import { safeChangeOrderStatus } from '../services/order-status.service.js';

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  adminNote: z.string().max(500).optional().nullable(),
});

function getOrderListParams(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const rawStatus = typeof query.status === 'string' ? query.status : undefined;
  const status = rawStatus && (Object.values(OrderStatus) as string[]).includes(rawStatus)
    ? (rawStatus as OrderStatus)
    : undefined;
  const search = typeof query.search === 'string' ? query.search.trim() : undefined;

  return {
    page,
    skip: (page - 1) * limit,
    take: limit,
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' as const } },
              { customerPhone: { contains: search } },
              { customerName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
  };
}

export class OrderController {
  static async getUserOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { skip, take, where } = getOrderListParams(req.query as Record<string, unknown>);

      const orders = await prisma.order.findMany({
        where: { userId, ...where },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: unknown) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
      });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          id: id as string,
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      res.json({
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

  static async getAllOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, skip, take, where } = getOrderListParams(req.query as Record<string, unknown>);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
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
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.order.count({ where }),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error: unknown) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
      });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNote } = updateOrderStatusSchema.parse(req.body);

      const result = await safeChangeOrderStatus(id as string, status, adminNote ?? null);

      if (!result.ok) {
        res.status(result.code).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order status updated',
        data: result.order,
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

      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order',
      });
    }
  }
}
