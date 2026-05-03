import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentController {
  /**
   * Create Stripe Checkout Session
   * POST /api/payment/create-checkout-session
   */
  async createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      // Get order with items
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

      // Check if order already paid
      if (order.paymentStatus === 'SUCCEEDED') {
        res.status(400).json({ error: 'Order already paid' });
        return;
      }

      // Prepare items for Stripe
      const items = order.items.map(item => {
        const snapshot = item.productSnapshot as { name: string };
        return {
          name: snapshot.name,
          price: Number(item.price),
          quantity: item.quantity,
        };
      });

      // Create Stripe session
      const session = await stripeService.createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        items,
        total: Number(order.total),
        customerEmail: order.customerEmail,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Stripe Webhook
   * POST /api/payment/webhook
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
      }

      // req.body should be raw buffer for webhook verification
      const result = await stripeService.handleWebhook(signature, req.body);

      res.json(result);
    } catch (error) {
      console.error('Webhook error:', error);
      next(error);
    }
  }

  /**
   * Get Checkout Session Status
   * GET /api/payment/session/:sessionId
   */
  async getSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;

      const session = await stripeService.getCheckoutSession(sessionId);

      // Get order by session ID
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

  /**
   * Create Refund
   * POST /api/payment/refund
   */
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

      // Update order status
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
