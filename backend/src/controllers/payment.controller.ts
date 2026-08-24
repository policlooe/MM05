import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service.js';
import {
  yooKassaService,
  YooKassaError,
  ykStatusToPaymentStatus,
} from '../services/yookassa.service.js';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export type ActivePaymentProvider = 'STRIPE' | 'YOOKASSA';

/** Активный провайдер задаётся переменной окружения PAYMENT_PROVIDER (по умолчанию STRIPE) */
export function getActiveProvider(): ActivePaymentProvider {
  return process.env.PAYMENT_PROVIDER === 'YOOKASSA' ? 'YOOKASSA' : 'STRIPE';
}

export class PaymentController {
  async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.userId && order.userId !== req.user?.userId) {
        res.status(403).json({ error: 'Access denied for this order' });
        return;
      }

      if (order.paymentStatus === 'SUCCEEDED') {
        res.status(400).json({ error: 'Order already paid' });
        return;
      }

      if (!order.isStockReserved || order.status !== 'RESERVED') {
        res.status(400).json({ error: 'Order stock is not reserved' });
        return;
      }

      const provider = getActiveProvider();

      if (provider === 'YOOKASSA') {
        if (!yooKassaService.isConfigured()) {
          res.status(503).json({ error: 'Payment provider is not configured' });
          return;
        }

        // Бэкенд сам считает итоговую сумму из заказа (total рассчитан серверно при создании)
        const { payment } = await yooKassaService.createSbpPaymentForOrder({
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          customerEmail: order.customerEmail,
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?order_id=${order.id}&provider=yookassa`,
        });

        const confirmationUrl = payment.confirmation?.confirmation_url;
        if (!confirmationUrl) {
          res.status(502).json({ error: 'Payment provider returned no confirmation URL' });
          return;
        }

        res.json({
          success: true,
          data: {
            sessionId: payment.id,
            url: confirmationUrl,
            orderId: order.id,
            orderNumber: order.orderNumber,
            provider,
          },
        });
        return;
      }

      const items = order.items.map(item => {
        const snapshot = item.productSnapshot as { name?: string } | null;
        return {
          name: snapshot?.name || 'Product',
          price: Number(item.price),
          quantity: item.quantity,
        };
      });

      const session = await stripeService.createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        items,
        total: Number(order.total),
        customerEmail: order.customerEmail,
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
          orderId: order.id,
          orderNumber: order.orderNumber,
          provider,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Статус оплаты заказа для фронтенд-поллинга после возврата с оплаты.
   * Доступ: владелец заказа, админ ИЛИ knowledge-of-id (capability):
   * query-параметр ?pid= должен совпадать с providerPaymentId заказа.
   */
  async getOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId: rawOrderId } = req.params;
      const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
      const rawPid = req.query.pid;
      const capabilityId = typeof rawPid === 'string' ? rawPid : undefined;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          paymentStatus: true,
          status: true,
          paymentProvider: true,
          providerPaymentId: true,
          orderNumber: true,
        },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const isAdmin = req.user?.role === 'ADMIN';
      const isOwner = order.userId && req.user && order.userId === req.user.userId;
      const hasCapability = Boolean(
        capabilityId && order.providerPaymentId && capabilityId === order.providerPaymentId
      );

      if (!isAdmin && !isOwner && !hasCapability) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Активный провайдер может уточнить статус напрямую (самопроверка бэкенда)
      let liveStatus: string | null = null;
      if (
        order.paymentProvider === 'YOOKASSA' &&
        order.providerPaymentId &&
        (paymentStatusIsPending(order.paymentStatus))
      ) {
        try {
          const payment = await yooKassaService.getPayment(order.providerPaymentId);
          liveStatus = payment.status;
          if (payment.status !== 'pending' && payment.status !== 'waiting_for_capture') {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: ykStatusToPaymentStatus(payment.status) },
            });
          }
        } catch (error) {
          // Недоступность провайдера не ломает поллинг — вернём сохранённый статус
          if (!(error instanceof YooKassaError)) throw error;
        }
      }

      res.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        liveProviderStatus: liveStatus,
        orderStatus: order.status,
        provider: order.paymentProvider,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;

      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId },
        select: { id: true, userId: true },
      });

      // IDOR-защита: статус сессии доступен только владельцу заказа или админу
      const isAdmin = req.user?.role === 'ADMIN';
      const isOwner = order && req.user && order.userId === req.user.userId;

      if (!isAdmin && !isOwner) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const session = await stripeService.getCheckoutSession(sessionId);

      res.json({
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        order: order ? {
          id: order.id,
        } : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRefund(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, amount, reason, description } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          return { code: 404 as const, error: 'Order not found' };
        }

        if (!order.stripePaymentId) {
          return { code: 400 as const, error: 'No payment found for this order' };
        }

        if (order.paymentStatus !== 'SUCCEEDED') {
          return { code: 400 as const, error: 'Order is not paid' };
        }

        const refund = await stripeService.createRefund(
          order.stripePaymentId,
          amount ? Number(amount) : undefined,
          reason,
          description
        );

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'REFUNDED',
            status: 'CANCELLED',
            cancelledAt: new Date(),
            isStockReserved: false,
          },
        });

        // Возврат товара на склад после рефанда
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        return {
          code: 200 as const,
          refund: {
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
          },
        };
      });

      if (result.code !== 200) {
        res.status(result.code).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        refund: result.refund,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();

function paymentStatusIsPending(status: string): boolean {
  return status === 'PENDING' || status === 'PROCESSING';
}
