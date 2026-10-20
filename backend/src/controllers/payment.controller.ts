import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service.js';
import {
  yooKassaService,
  YooKassaError,
} from '../services/yookassa.service.js';
import { orderPaymentService } from '../services/order-payment.service.js';
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

          // Статус меняется ТОЛЬКО через тот же идемпотентный фулфилмент, что и
          // вебхук. Прямая запись paymentStatus оставляла заказ в RESERVED с
          // оплаченным платежом: без paidAt, списания стока, salesCount,
          // очистки корзины и письма.
          if (payment.status === 'succeeded') {
            await orderPaymentService.fulfillPaidOrder({
              orderId: order.id,
              provider: 'YOOKASSA',
              externalPaymentId: payment.id,
            });
          } else if (payment.status === 'canceled') {
            await orderPaymentService.failOrder(order.id, 'YOOKASSA');
          }
        } catch (error) {
          // Недоступность провайдера не ломает поллинг — вернём сохранённый статус
          if (!(error instanceof YooKassaError)) throw error;
        }
      }

      // Перечитываем статусы: поллинг мог только что перевести заказ в оплаченный
      const fresh = await prisma.order.findUnique({
        where: { id: order.id },
        select: { paymentStatus: true, status: true },
      });

      res.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: fresh?.paymentStatus ?? order.paymentStatus,
        liveProviderStatus: liveStatus,
        orderStatus: fresh?.status ?? order.status,
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

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (!order.stripePaymentId) {
        res.status(400).json({ error: 'No payment found for this order' });
        return;
      }

      if (order.paymentStatus !== 'SUCCEEDED') {
        res.status(400).json({ error: 'Order is not paid' });
        return;
      }

      const orderTotal = Number(order.total);
      const requestedAmount =
        amount === undefined || amount === null ? orderTotal : Number(amount);

      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        res.status(400).json({ error: 'Invalid refund amount' });
        return;
      }

      if (requestedAmount > orderTotal + 0.01) {
        res.status(400).json({ error: 'Refund amount exceeds order total' });
        return;
      }

      const isFullRefund = requestedAmount >= orderTotal - 0.01;

      // Атомарный захват до вызова Stripe: два параллельных запроса не могут
      // одновременно увидеть SUCCEEDED и вернуть деньги дважды.
      const claim = await prisma.order.updateMany({
        where: { id: orderId, paymentStatus: 'SUCCEEDED' },
        data: { paymentStatus: 'PROCESSING' },
      });

      if (claim.count !== 1) {
        res.status(409).json({ error: 'Refund already in progress for this order' });
        return;
      }

      let refund;
      try {
        // Внешний вызов — ВНЕ транзакции БД: таймаут транзакции после успешного
        // возврата оставлял деньги возвращёнными, а заказ — оплаченным.
        refund = await stripeService.createRefund(
          order.stripePaymentId,
          isFullRefund ? undefined : requestedAmount,
          reason,
          description
        );
      } catch (error) {
        await prisma.order.updateMany({
          where: { id: orderId, paymentStatus: 'PROCESSING' },
          data: { paymentStatus: 'SUCCEEDED' },
        });
        throw error;
      }

      if (isFullRefund) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'REFUNDED',
              status: 'CANCELLED',
              cancelledAt: new Date(),
              isStockReserved: false,
            },
          });

          // Возврат товара на склад только при полном возврате
          for (const item of order.items) {
            if (!item.productId) continue;

            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        });
      } else {
        // Частичный возврат не отменяет заказ и не возвращает товар на склад
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'SUCCEEDED' },
        });
      }

      res.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          full: isFullRefund,
        },
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
