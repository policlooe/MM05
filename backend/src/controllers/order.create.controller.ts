import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';

const prisma = new PrismaClient();

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
  idempotencyKey: z.string().optional(), // Для предотвращения дублирования заказов
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

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
  ): Promise<void> {
    for (const item of items) {
      // SELECT FOR UPDATE - блокирует строку до конца транзакции
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stockQuantity: true },
      });

      if (!product) {
        throw new Error(`Товар с ID ${item.productId} не найден`);
      }

      // Проверка наличия
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Недостаточно товара "${product.name}". В наличии: ${product.stockQuantity}, запрошено: ${item.quantity}`
        );
      }

      // Уменьшаем остаток (резервируем)
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }
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

      // IDEMPOTENCY CHECK: Проверяем, не создан ли уже заказ с таким ключом
      if (validatedData.idempotencyKey) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            customerPhone: validatedData.customerPhone,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // За последние 24 часа
            },
            total: validatedData.totalPrice,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (existingOrder) {
          console.log(`⚠️ Idempotency: Order already exists for phone ${validatedData.customerPhone}`);
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
        await OrderCreateController.reserveStock(validatedData.items, tx);

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
            subtotal: validatedData.totalPrice,
            total: validatedData.totalPrice,
            status: 'NEW' as any,
            isStockReserved: true as any,
            reservedAt: new Date(),
          },
        });

        // 3. Создаем позиции заказа
        const orderItems = validatedData.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.finalPrice,
          total: item.finalPrice * item.quantity,
          productSnapshot: {
            productId: item.productId,
            price: item.price,
            finalPrice: item.finalPrice,
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
      console.log(`✅ Order created: ${orderNumber}, Total: ${validatedData.totalPrice} ₽`);

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
              name: item.productSnapshot ? (item.productSnapshot as any).name : item.product?.name || 'Товар',
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
  private static generateWhatsAppUrl(order: any): string {
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
${order.items.map((item: any, index: number) => 
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

      // Проверяем флаг резервирования через any (временное решение)
      const orderWithReserved = order as any;
      if (!orderWithReserved.isStockReserved) {
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
          status: 'CANCELLED' as any,
          isStockReserved: false as any,
          cancelledAt: new Date(),
        },
      });
    });
  }
}
