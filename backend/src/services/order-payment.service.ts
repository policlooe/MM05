import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { emailService } from './email.service.js';
import { captureError, captureMessage } from '../lib/sentry.js';
import { prisma } from '../lib/prisma.js';

/**
 * Провайдер-агностичный фулфилмент заказа.
 * Используется и Stripe-, и YooKassa-вебхуками.
 *
 * Ключевая гарантия идемпотентности: условный updateMany «захватывает» заказ
 * только из payable-состояния (PENDING/PROCESSING + RESERVED + stock reserved).
 * Повторный вебхук по уже оплаченному заказу вернёт count=0 и не выполнит
 * побочные эффекты (salesCount, очистка корзины, письмо) второй раз.
 */

type OrderWithItemsAndCart = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    user: { include: { cart: true } };
  };
}>;

const PAYABLE_STATUSES = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];

export interface FulfillSuccessInput {
  orderId: string;
  provider: 'STRIPE' | 'YOOKASSA';
  externalPaymentId?: string;
  /** Для Stripe дублируем id в legacy-колонку stripe_payment_id (рефанды читают её) */
  legacyStripePaymentId?: boolean;
}

export class OrderPaymentService {
  /**
   * Отметить заказ оплаченным. Идемпотентно: повторный вызов — no-op.
   * Возвращает true, если именно этот вызов выполнил переход.
   */
  async fulfillPaidOrder(input: FulfillSuccessInput): Promise<boolean> {
    const { orderId, provider, externalPaymentId, legacyStripePaymentId } = input;

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
            paidAt: new Date(),
            confirmedAt: new Date(),
            paymentProvider: provider,
            ...(externalPaymentId ? { providerPaymentId: externalPaymentId } : {}),
            ...(legacyStripePaymentId && externalPaymentId
              ? { stripePaymentId: externalPaymentId }
              : {}),
          },
        });

        if (claim.count !== 1) {
          const existing = await tx.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true },
          });

          return {
            claimed: false as const,
            reason: !existing
              ? ('missing' as const)
              : existing.paymentStatus === PaymentStatus.SUCCEEDED
                ? ('duplicate-success' as const)
                : ('not-payable' as const),
          };
        }

        const updatedOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } }, user: { include: { cart: true } } },
        });

        if (!updatedOrder) {
          return { claimed: false as const, reason: 'missing' as const };
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

        return { claimed: true as const, order: updatedOrder };
      });

      if (!result.claimed) {
        captureMessage(
          `${provider} success webhook ignored for order ${orderId}: ${result.reason}`,
          'info'
        );
        return false;
      }

      captureMessage(`Order ${orderId} successfully marked as paid via ${provider}`, 'info');

      await this.sendConfirmationEmailSafe(result.order);
      return true;
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Transaction failed for order fulfillment'),
        { orderId }
      );
      throw error;
    }
  }

  /**
   * Отметить платёж неудачным/отменённым: освобождает склад, отменяет заказ.
   * Идемпотентно: повторный вызов — no-op.
   */
  async failOrder(orderId: string, provider: 'STRIPE' | 'YOOKASSA'): Promise<void> {
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
            paymentProvider: provider,
          },
        });

        if (claim.count !== 1) {
          const existing = await tx.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true },
          });

          if (!existing) return 'missing' as const;
          if (existing.paymentStatus === PaymentStatus.SUCCEEDED) return 'paid' as const;
          if (existing.paymentStatus === PaymentStatus.FAILED) return 'duplicate-failure' as const;

          // Заказ в нестандартном состоянии (например REFUNDED) — только фиксируем статус платежа
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

      captureMessage(`${provider} failure webhook handled for order ${orderId}: ${result}`, 'info');
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
}

function getProductSnapshotName(snapshot: Prisma.JsonValue): string | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return null;
  }

  const name = (snapshot as { name?: unknown }).name;
  return typeof name === 'string' ? name : null;
}

export const orderPaymentService = new OrderPaymentService();
