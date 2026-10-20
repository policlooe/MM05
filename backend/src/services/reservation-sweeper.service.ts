import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { captureError, captureMessage } from '../lib/sentry.js';

/**
 * Освобождение «зависших» резервов склада.
 *
 * `POST /api/orders` публичный и сразу списывает сток под резерв. Оплату
 * покупатель может не завершить (закрыл вкладку, СБП не прошёл), и до этого
 * момента такой резерв никто не снимал: товар оставался недоступен навсегда.
 * Достаточно нескольких брошенных корзин, чтобы обнулить наличие популярной
 * позиции, поэтому резерв должен истекать.
 */

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const SWEEP_BATCH_SIZE = 50;

const RELEASABLE_PAYMENT_STATUSES = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];

/**
 * Снимает резерв с заказов старше `ttlMinutes` и возвращает товар на склад.
 * Возвращает количество освобождённых заказов.
 */
export async function releaseExpiredReservations(ttlMinutes: number): Promise<number> {
  const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);

  const expired = await prisma.order.findMany({
    where: {
      isStockReserved: true,
      paymentStatus: { in: RELEASABLE_PAYMENT_STATUSES },
      reservedAt: { lt: cutoff },
    },
    select: { id: true, orderNumber: true },
    orderBy: { reservedAt: 'asc' },
    take: SWEEP_BATCH_SIZE,
  });

  let released = 0;

  for (const order of expired) {
    try {
      const didRelease = await prisma.$transaction(async (tx) => {
        // Условный захват: если оплата пришла между выборкой и транзакцией,
        // заказ уже не PENDING и мы его не трогаем.
        const claim = await tx.order.updateMany({
          where: {
            id: order.id,
            isStockReserved: true,
            paymentStatus: { in: RELEASABLE_PAYMENT_STATUSES },
          },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            status: OrderStatus.CANCELLED,
            isStockReserved: false,
            cancelledAt: new Date(),
          },
        });

        if (claim.count !== 1) return false;

        const items = await tx.orderItem.findMany({
          where: { orderId: order.id },
          select: { productId: true, quantity: true },
        });

        for (const item of items) {
          if (!item.productId) continue;

          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }

        return true;
      });

      if (didRelease) {
        released += 1;
        captureMessage(
          `Expired stock reservation released: order ${order.orderNumber}`,
          'info'
        );
      }
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Failed to release expired reservation'),
        { orderId: order.id }
      );
    }
  }

  return released;
}

/**
 * Запускает периодическую очистку. Возвращает функцию остановки.
 * TTL задаётся `STOCK_RESERVATION_TTL_MINUTES` (по умолчанию 60 минут).
 */
export function startReservationSweeper(): () => void {
  const ttlMinutes = Number(process.env.STOCK_RESERVATION_TTL_MINUTES ?? 60);

  if (!Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
    console.warn('⚠️ Reservation sweeper disabled: invalid STOCK_RESERVATION_TTL_MINUTES');
    return () => undefined;
  }

  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;

    try {
      const released = await releaseExpiredReservations(ttlMinutes);
      if (released > 0) {
        console.log(`♻️ Released ${released} expired stock reservation(s)`);
      }
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Reservation sweeper run failed')
      );
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void tick(), SWEEP_INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}
