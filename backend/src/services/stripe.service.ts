import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { emailService } from './email.service';

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia' as any,
});

interface CreateCheckoutSessionData {
  orderId: string;
  orderNumber: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  customerEmail: string;
}

export class StripeService {
  /**
   * Create Stripe Checkout Session
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<any> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: data.items.map(item => ({
        price_data: {
          currency: 'rub',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to kopecks
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${data.orderId}`,
      customer_email: data.customerEmail,
      metadata: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Save session ID to order
    await prisma.order.update({
      where: { id: data.orderId },
      data: { stripeSessionId: session.id },
    });

    return session;
  }

  /**
   * Handle Stripe Webhook
   */
  async handleWebhook(signature: string, body: Buffer): Promise<{ received: boolean }> {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = err as Error;
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        await this.handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful checkout session
   */
  private async handleCheckoutSessionCompleted(session: any): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
        stripePaymentId: session.payment_intent as string,
        paidAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`Order ${orderId} marked as PAID`);

    // Send confirmation email
    if (order.customerEmail && emailService.isAvailable()) {
      try {
        await emailService.sendOrderConfirmation({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: order.items.map(item => ({
            name: item.productSnapshot ? (item.productSnapshot as any).name : item.product?.name || 'Товар',
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.total),
          })),
          subtotal: Number(order.subtotal),
          deliveryCost: Number(order.deliveryCost),
          total: Number(order.total),
          deliveryAddress: order.deliveryAddress,
          customerPhone: order.customerPhone,
        });
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        // Don't throw - email failure shouldn't break the order process
      }
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
    // Additional logic if needed
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    console.log(`PaymentIntent ${paymentIntent.id} failed`);

    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
        },
      });
    }
  }

  /**
   * Retrieve checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<any> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Create refund
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if amount not specified
    });

    return refund;
  }
}

export const stripeService = new StripeService();
