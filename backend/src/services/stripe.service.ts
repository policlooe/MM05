import Stripe from 'stripe';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { emailService } from './email.service';
import { captureError, captureMessage } from '../lib/sentry';
import { prisma } from '../lib/prisma.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Единый инстанс Stripe для всего приложения
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
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
   * Генерация сессии оплаты
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: data.items.map(item => ({
          price_data: {
            currency: 'rub',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100), // kopecks
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
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 min TTL
      });

      await prisma.order.update({
        where: { id: data.orderId },
        data: { stripeSessionId: session.id },
      });

      return session;
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Failed to create checkout session'),
        { data }
      );
      throw error;
    }
  }

  /**
   * Бизнес-логика успешной оплаты (ACID Транзакция)
   */
  async processCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      const msg = 'Stripe webhook missing orderId in metadata';
      captureMessage(msg, 'warning');
      return;
    }

    try {
      // Используем Prisma Transaction для гарантированной консистентности (ACID)
      const order = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.SUCCEEDED,
            status: OrderStatus.CONFIRMED,
            stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
            paidAt: new Date(),
          },
          include: { items: { include: { product: true } } },
        });

        // Безопасное списание остатков товаров в рамках той же транзакции
        for (const item of updatedOrder.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { decrement: item.quantity },
                salesCount: { increment: item.quantity },
              },
            });
          }
        }

        return updatedOrder;
      });

      captureMessage(`Order ${orderId} successfully marked as PAID`, 'info');

      // Асинхронная отправка email (не блокируем ответ вебхука)
      this.sendConfirmationEmailSafe(order);
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Transaction failed for order fulfillment'),
        { orderId }
      );
      throw error;
    }
  }

  async processPaymentFailed(session: Stripe.Checkout.Session | Stripe.PaymentIntent): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    captureMessage(`Order ${orderId} payment failed and cancelled`, 'info');
  }

  private async sendConfirmationEmailSafe(order: any): Promise<void> {
    if (!order.customerEmail || !emailService.isAvailable()) return;

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
        items: order.items.map((item: any) => ({
          name: item.productSnapshot?.name || item.product?.name || 'Товар',
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
      // Изолируем сбой отправки email от бизнес-процесса заказа
      captureError(error as Error, {
        context: 'sendConfirmationEmailSafe',
        orderId: order.id,
      });
    }
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Response<Stripe.Refund>> {
    return stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }
}

export const stripeService = new StripeService();
