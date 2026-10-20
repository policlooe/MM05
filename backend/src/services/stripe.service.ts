import Stripe from 'stripe';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { emailService } from './email.service.js';
import { captureError, captureMessage } from '../lib/sentry.js';
import { prisma } from '../lib/prisma.js';

// Stripe обязателен только когда он выбран активным провайдером. При
// PAYMENT_PROVIDER=YOOKASSA приложение должно стартовать без Stripe-ключей.
if (!process.env.STRIPE_SECRET_KEY && process.env.PAYMENT_PROVIDER !== 'YOOKASSA') {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_not_configured', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

interface CreateCheckoutSessionData {
  orderId: string;
  orderNumber: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  customerEmail?: string | null;
}

type OrderWithItemsAndCart = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    user: { include: { cart: true } };
  };
}>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYABLE_STATUSES = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];

export class StripeService {
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    try {
      const metadata = {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
      };

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: data.items.map(item => ({
          price_data: {
            currency: 'rub',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${data.orderId}`,
        metadata,
        payment_intent_data: { metadata },
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      };

      if (data.customerEmail && EMAIL_REGEX.test(data.customerEmail)) {
        sessionParams.customer_email = data.customerEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      await prisma.order.update({
        where: { id: data.orderId },
        data: {
          stripeSessionId: session.id,
          paymentStatus: PaymentStatus.PROCESSING,
        },
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

  async processCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      captureMessage('Stripe webhook missing orderId in metadata', 'warning');
      return;
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const claim = await tx.order.updateMany({
          where: {
            id: orderId,
            paymentStatus: { in: PAYABLE_STATUSES },
            status: OrderStatus.RESERVED,
            isStockReserved: true,
          },
          data: {
            paymentStatus: PaymentStatus.SUCCEEDED,
            status: OrderStatus.CONFIRMED,
            isStockReserved: false,
            stripePaymentId: getPaymentIntentId(session),
            paidAt: new Date(),
            confirmedAt: new Date(),
          },
        });

        if (claim.count !== 1) {
          const existingOrder = await tx.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true, status: true, isStockReserved: true },
          });

          if (!existingOrder) {
            return { order: null, shouldSendEmail: false, reason: 'missing' as const };
          }

          const reason = existingOrder.paymentStatus === PaymentStatus.SUCCEEDED
            ? 'duplicate-success'
            : 'not-payable';

          return { order: null, shouldSendEmail: false, reason };
        }

        const updatedOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } }, user: { include: { cart: true } } },
        });

        if (!updatedOrder) {
          return { order: null, shouldSendEmail: false, reason: 'missing' as const };
        }

        for (const item of updatedOrder.items) {
          if (!item.productId) continue;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              salesCount: { increment: item.quantity },
            },
          });
        }

        if (updatedOrder.user?.cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: updatedOrder.user.cart.id },
          });
        }

        return { order: updatedOrder, shouldSendEmail: true, reason: 'paid' as const };
      });

      if (!result.order) {
        captureMessage(`Stripe success webhook ignored for order ${orderId}: ${result.reason}`, 'info');
        return;
      }

      captureMessage(`Order ${orderId} successfully marked as paid`, 'info');

      if (result.shouldSendEmail) {
        this.sendConfirmationEmailSafe(result.order);
      }
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

    try {
      const result = await prisma.$transaction(async (tx) => {
        const claim = await tx.order.updateMany({
          where: {
            id: orderId,
            paymentStatus: { in: PAYABLE_STATUSES },
            isStockReserved: true,
          },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            status: OrderStatus.CANCELLED,
            isStockReserved: false,
            cancelledAt: new Date(),
          },
        });

        if (claim.count !== 1) {
          const existingOrder = await tx.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true, isStockReserved: true },
          });

          if (!existingOrder) return 'missing' as const;
          if (existingOrder.paymentStatus === PaymentStatus.SUCCEEDED) return 'paid' as const;
          if (existingOrder.paymentStatus === PaymentStatus.FAILED) return 'duplicate-failure' as const;

          await tx.order.update({
            where: { id: orderId },
            data: { paymentStatus: PaymentStatus.FAILED },
          });

          return 'marked-failed' as const;
        }

        const failedOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!failedOrder) return 'missing' as const;

        for (const item of failedOrder.items) {
          if (!item.productId) continue;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }

        return 'released-stock' as const;
      });

      captureMessage(`Stripe failure webhook handled for order ${orderId}: ${result}`, 'info');
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Transaction failed for failed payment processing'),
        { orderId }
      );
      throw error;
    }
  }

  private async sendConfirmationEmailSafe(order: OrderWithItemsAndCart): Promise<void> {
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
        items: order.items.map(item => ({
          name: getProductSnapshotName(item.productSnapshot) || item.product?.name || 'Product',
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
      captureError(error as Error, {
        context: 'sendConfirmationEmailSafe',
        orderId: order.id,
      });
    }
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
    description?: string
  ): Promise<Stripe.Response<Stripe.Refund>> {
    // Stripe принимает reason только из фиксированного набора значений
    const stripeReason =
      reason === 'duplicate' || reason === 'fraudulent' || reason === 'requested_by_customer'
        ? reason
        : 'requested_by_customer';

    return stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: stripeReason,
      ...(description ? { metadata: { description } } : {}),
    });
  }
}

function getPaymentIntentId(session: Stripe.Checkout.Session): string | undefined {
  if (typeof session.payment_intent === 'string') return session.payment_intent;
  return session.payment_intent?.id;
}

function getProductSnapshotName(snapshot: Prisma.JsonValue): string | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return null;
  }

  const name = (snapshot as { name?: unknown }).name;
  return typeof name === 'string' ? name : null;
}

export const stripeService = new StripeService();
