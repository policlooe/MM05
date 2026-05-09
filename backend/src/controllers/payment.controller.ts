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
        customerEmail: order.customerEmail || order.customerName,
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
      const signature = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !webhookSecret) {
        res.status(400).json({ error: 'Missing signature or secret' });
        return;
      }

      let event;

      // Криптографическая валидация
      try {
        const stripe = (await import('../services/stripe.service')).stripe;
        event = stripe.webhooks.constructEvent(
          req.body, // Buffer expected here
          signature,
          webhookSecret
        );
      } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown signature error';
        res.status(400).json({ error: errMessage });
        return;
      }

      // Делегирование бизнес-логики сервису
      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          await stripeService.processCheckoutCompleted(event.data.object as any);
          break;

        case 'checkout.session.async_payment_failed':
        case 'payment_intent.payment_failed':
          await stripeService.processPaymentFailed(event.data.object as any);
          break;

        case 'payment_intent.succeeded':
          console.log(`PaymentIntent succeeded: ${(event.data.object as any).id}`);
          break;

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
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
