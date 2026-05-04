import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';

const prisma = new PrismaClient();

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  adminNote: z.string().max(500).optional().nullable(),
});

export class OrderController {
  static async getUserOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
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
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      });
    }
  }

  static async getAllOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await prisma.order.findMany({
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
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNote } = updateOrderStatusSchema.parse(req.body);

      const order = await prisma.order.update({
        where: { id: id as string },
        data: {
          status,
          adminNote,
          ...(status === OrderStatus.CONFIRMED && { confirmedAt: new Date() }),
          ...(status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
          ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
          ...(status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
        },
        include: {
          user: true,
          items: true,
        },
      });

      // Отправляем email уведомление об изменении статуса
      if (order.customerEmail && emailService.isAvailable()) {
        try {
          const statusMessages: Record<string, string> = {
            NEW: 'Новый заказ',
            RESERVED: 'Товары зарезервированы',
            CONFIRMED: 'Заказ подтвержден',
            PROCESSING: 'Заказ в обработке',
            SHIPPED: 'Заказ отправлен',
            DELIVERED: 'Заказ доставлен',
            COMPLETED: 'Заказ завершен',
            CANCELLED: 'Заказ отменен',
          };

          await emailService.sendOrderStatusUpdate(
            order.customerEmail,
            order.customerName,
            order.orderNumber,
            status,
            statusMessages[status] || status
          );
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Не прерываем процесс обновления статуса из-за ошибки email
        }
      }

      res.json({
        success: true,
        message: 'Order status updated',
        data: order,
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
        error: error instanceof Error ? error.message : 'Failed to update order',
      });
    }
  }
}
