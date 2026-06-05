import { Response } from 'express';
import { OrderStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';
import { prisma } from '../lib/prisma.js';

// Валидация входных данных
const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  customerPhone: z.string().min(10, 'Введите корректный номер телефона').max(20),
  customerEmail: z.string().email('Некорректный email').optional().nullable(),
  deliveryAddress: z.string().min(10, 'Введите полный адрес доставки').max(500),
  customerNote: z.string().max(1000).optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
      price: z.number().positive(),
      finalPrice: z.number().positive(),
      configuration: z.any().optional(),
      options: z.any().optional(),
    })
  ).min(1, 'Корзина пуста'),
  totalPrice: z.number().positive(),
  idempotencyKey: z.string().min(8).max(200).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type ReservedOrderItem = CreateOrderInput['items'][number] & {
  productName: string;
  serverPrice: number;
  lineTotal: number;
};

export class OrderCreateController {
  /**
   * Генерация уникального номера заказа: MM05-2026-0001
   */
  private static async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MM05-${year}-`;

    // Находим последний заказ за текущий год
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Резервирование товара с защитой от перепродажи
   * Использует транзакцию с row-level locking
   */
  private static async reserveStock(
    items: CreateOrderInput['items'],
    tx: Prisma.TransactionClient
  ): Promise<ReservedOrderItem[]> {
    const reservedItems: ReservedOrderItem[] = [];
    for (const item of items) {
      // SELECT FOR UPDATE - блокирует строку до конца транзакции
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, stockQuantity: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Товар с ID ${item.productId} не найден`);
      }

      // Проверка наличия
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Недостаточно товара "${product.name}". В наличии: ${product.stockQuantity}, запрошено: ${item.quantity}`
        );
      }

      // Уменьшаем остаток (резервируем)
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQuantity: { gte: item.quantity },
        },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error(
          `Недостаточно товара "${product.name}". В наличии: ${product.stockQuantity}, запрошено: ${item.quantity}`
        );
      }

      const serverPrice = Number(product.price);

      reservedItems.push({
        ...item,
        productName: product.name,
        serverPrice,
        lineTotal: serverPrice * item.quantity,
      });
    }

    return reservedItems;
  }

  /**
   * Создание заказа с резервированием товара
   * POST /api/orders
   */
  static async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Валидация входных данных
      const validatedData = createOrderSchema.parse(req.body);

      // Получаем userId если пользователь авторизован
      const userId = req.user?.userId || null;

      if (validatedData.idempotencyKey) {
        const existingOrder = await prisma.order.findUnique({
          where: { idempotencyKey: validatedData.idempotencyKey },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (existingOrder) {
          console.log(`Idempotency hit: order ${existingOrder.orderNumber}`);
          res.status(200).json({
            success: true,
            message: 'Заказ уже создан',
            data: {
              order: existingOrder,
              whatsappUrl: OrderCreateController.generateWhatsAppUrl(existingOrder),
            },
          });
          return;
        }
      }

      // Генерируем уникальный номер заказа
      const orderNumber = await OrderCreateController.generateOrderNumber();

      // Выполняем всё в транзакции для атомарности
      const order = await prisma.$transaction(async (tx) => {
        // 1. Резервируем товар (с проверкой наличия и блокировкой)
        const reservedItems = await OrderCreateController.reserveStock(validatedData.items, tx);
        const serverTotal = reservedItems.reduce((sum, item) => sum + item.lineTotal, 0);

        if (Math.abs(serverTotal - validatedData.totalPrice) > 0.01) {
          throw new Error('Итоговая сумма заказа не совпадает с актуальными ценами');
        }

        // 2. Создаем заказ
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: userId || undefined,
            customerName: validatedData.customerName,
            customerPhone: validatedData.customerPhone,
            customerEmail: validatedData.customerEmail || undefined,
            deliveryAddress: validatedData.deliveryAddress,
            customerNote: validatedData.customerNote || undefined,
            subtotal: serverTotal,
            total: serverTotal,
            status: OrderStatus.RESERVED,
            isStockReserved: true,
            reservedAt: new Date(),
            idempotencyKey: validatedData.idempotencyKey,
          },
        });

        // 3. Создаем позиции заказа
        const orderItems = reservedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.serverPrice,
          total: item.lineTotal,
          productSnapshot: {
            productId: item.productId,
            name: item.productName,
            price: item.serverPrice,
            finalPrice: item.serverPrice,
            configuration: item.configuration || null,
          },
          options: item.options || {},
        }));

        await tx.orderItem.createMany({
          data: orderItems,
        });

        // 4. Получаем полный заказ с позициями
        return await tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      // Логируем успешное создание заказа
      console.log(`✅ Order created: ${orderNumber}, Total: ${order!.total} ₽`);

      // Отправляем email подтверждение (если email указан)
      if (order!.customerEmail && emailService.isAvailable()) {
        try {
          await emailService.sendOrderConfirmation({
            customerName: order!.customerName,
            customerEmail: order!.customerEmail,
            orderNumber: order!.orderNumber,
            orderDate: order!.createdAt.toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            items: order!.items.map(item => ({
              name: getProductSnapshotName(item.productSnapshot) || item.product?.name || 'Товар',
              quantity: item.quantity,
              price: Number(item.price),
              total: Number(item.total),
            })),
            subtotal: Number(order!.subtotal),
            deliveryCost: Number(order!.deliveryCost),
            total: Number(order!.total),
            deliveryAddress: order!.deliveryAddress,
            customerPhone: order!.customerPhone,
          });
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
          // Не прерываем процесс создания заказа из-за ошибки email
        }
      }

      res.status(201).json({
        success: true,
        message: 'Заказ успешно создан',
        data: {
          order,
          whatsappUrl: OrderCreateController.generateWhatsAppUrl(order!),
        },
      });
    } catch (error: unknown) {
      console.error('❌ Order creation error:', error);

      // Обработка ошибок валидации
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Ошибка валидации данных',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      // Обработка ошибок недостатка товара
      if (error instanceof Error && error.message.includes('Недостаточно товара')) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Общая ошибка
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Не удалось создать заказ',
      });
    }
  }

  /**
   * Генерация ссылки для WhatsApp уведомления
   */
  private static generateWhatsAppUrl(order: Prisma.OrderGetPayload<{ include: { items: { include: { product: true } } } }>): string {
    const managerPhone = '79288331532'; // Номер менеджера
    
    const message = `
🛒 *Новый заказ №${order.orderNumber}*

👤 *Клиент:*
${order.customerName}
📞 ${order.customerPhone}
${order.customerEmail ? `📧 ${order.customerEmail}` : ''}

📍 *Адрес доставки:*
${order.deliveryAddress}

💰 *Сумма заказа:* ${order.total} ₽

📦 *Товары:*
${order.items.map((item, index: number) =>
  `${index + 1}. ${item.product?.name || 'Товар'} × ${item.quantity} = ${item.total} ₽`
).join('\n')}

${order.customerNote ? `💬 *Комментарий:*\n${order.customerNote}` : ''}

⏰ Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}
    `.trim();

    return `https://wa.me/${managerPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Отмена резервирования при отмене заказа
   */
  static async cancelOrderAndReleaseStock(orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Заказ не найден');
      }

      if (!order.isStockReserved) {
        throw new Error('Товар не был зарезервирован');
      }

      // Возвращаем товар на склад
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Обновляем статус заказа
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          isStockReserved: false,
          cancelledAt: new Date(),
        },
      });
    });
  }
}

function getProductSnapshotName(snapshot: Prisma.JsonValue): string | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return null;
  }

  const name = snapshot.name;
  return typeof name === 'string' ? name : null;
}
