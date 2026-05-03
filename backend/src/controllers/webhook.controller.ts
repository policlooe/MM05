import { Request, Response } from 'express';
import { PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export class WebhookController {
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).json({
        success: false,
        error: 'Missing stripe-signature header',
      });
      return;
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: unknown) {
      console.error('Webhook signature verification failed:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook signature verification failed',
      });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          await WebhookController.handleCheckoutCompleted(session);
          break;
        }

        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object as any;
          await WebhookController.handlePaymentSucceeded(session);
          break;
        }

        case 'checkout.session.async_payment_failed': {
          const session = event.data.object as any;
          await WebhookController.handlePaymentFailed(session);
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as any;
          console.log('PaymentIntent succeeded:', paymentIntent.id);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          console.log('PaymentIntent failed:', paymentIntent.id);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: unknown) {
      console.error('Webhook handler error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      });
    }
  }

  private static async handleCheckoutCompleted(session: any): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: OrderStatus.PAID,
        paidAt: new Date(),
        stripePaymentId: session.payment_intent as string,
      },
    });

    // Update product stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId! },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
              salesCount: {
                increment: item.quantity,
              },
            },
          })
        )
      );
    }

    console.log(`Order ${orderId} marked as PAID`);
  }

  private static async handlePaymentSucceeded(session: any): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: OrderStatus.PAID,
        paidAt: new Date(),
      },
    });

    console.log(`Order ${orderId} payment succeeded`);
  }

  private static async handlePaymentFailed(session: any): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    console.log(`Order ${orderId} payment failed`);
  }
}
