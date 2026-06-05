import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

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
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;

      const session = await stripeService.getCheckoutSession(sessionId);
      const order = await prisma.order.findFirst({
        where: { stripeSessionId: sessionId },
      });

      res.json({
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        order: order ? {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
        } : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, amount } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      const refund = await stripeService.createRefund(
        order.stripePaymentId,
        amount ? Number(amount) : undefined
      );

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED',
        },
      });

      res.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
