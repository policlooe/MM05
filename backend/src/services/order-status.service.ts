import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { captureError } from '../lib/sentry.js';
import { emailService } from './email.service.js';
import { OrderCreateController } from '../controllers/order.create.controller.js';

/**
 * Допустимые переходы статусов заказа (жизненный цикл защищён бэкендом):
 * NEW → RESERVED → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → COMPLETED
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: [OrderStatus.RESERVED, OrderStatus.CANCELLED],
  RESERVED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  NEW: 'Новый заказ',
  RESERVED: 'Товары зарезервированы',
  CONFIRMED: 'Заказ подтвержден',
  PROCESSING: 'Заказ в обработке',
  SHIPPED: 'Заказ отправлен',
  DELIVERED: 'Заказ доставлен',
  COMPLETED: 'Заказ завершен',
  CANCELLED: 'Заказ отменен',
};

type UpdatedOrder = Prisma.OrderGetPayload<{
  include: {
    items: true;
    user: { select: { id: true; email: true; fullName: true; phone: true } };
  };
}>;

export type ChangeStatusResult =
  | { ok: true; order: UpdatedOrder }
  | { ok: false; code: 404 | 409; message: string };

/**
 * Единственная точка изменения статуса заказа (используется и пользовательским,
 * и админским эндпоинтом): валидация перехода, возврат стока при отмене,
 * таймстампы жизненного цикла, email-уведомление клиента.
 */
export async function changeOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNote?: string | null
): Promise<ChangeStatusResult> {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, isStockReserved: true },
    });

    if (!existing) {
      return { ok: false as const, code: 404 as const, message: 'Заказ не найден' };
    }

    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(status)) {
      return {
        ok: false as const,
        code: 409 as const,
        message: `Недопустимый переход статуса: ${existing.status} → ${status}`,
      };
    }

    // Отмена незавершённого заказа: возвращаем зарезервированный сток
    if (status === OrderStatus.CANCELLED && existing.isStockReserved) {
      await OrderCreateController.releaseReservedStock(existing.id, tx);
    }

    return {
      ok: true as const,
      data: await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(adminNote !== undefined ? { adminNote } : {}),
          ...(status === OrderStatus.CONFIRMED && { confirmedAt: new Date() }),
          ...(status === OrderStatus.PROCESSING && { confirmedAt: new Date() }),
          ...(status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
          ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
          ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
          ...(status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
    };
  });

  if (!result.ok) {
    return result;
  }

  const order = result.data;

  // Email уведомление об изменении статуса (не блокирует операцию при ошибке)
  if (order.customerEmail && emailService.isAvailable()) {
    try {
      await emailService.sendOrderStatusUpdate(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        status,
        STATUS_MESSAGES[status] || status
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }
  }

  return { ok: true, order };
}

/**
 * Обёртка с обработкой ошибок для контроллеров
 */
export async function safeChangeOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNote?: string | null
): Promise<ChangeStatusResult | { ok: false; code: 500; message: string }> {
  try {
    return await changeOrderStatus(orderId, status, adminNote);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { ok: false, code: 404, message: 'Заказ не найден' };
    }
    console.error('Change order status error:', error);
    captureError(error instanceof Error ? error : new Error('Change order status failed'));
    return { ok: false, code: 500, message: 'Не удалось обновить статус заказа' };
  }
}
