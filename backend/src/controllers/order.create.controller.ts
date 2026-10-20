import { Response } from 'express';
import { OrderStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';
import { prisma } from '../lib/prisma.js';
import { captureError } from '../lib/sentry.js';
import { calculateServerItemPrice } from '../utils/pricing.js';

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

const MAX_ORDER_NUMBER_RETRIES = 5;

function isUniqueConstraintError(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }
  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.some((t) => String(t).includes(field));
  }
  if (typeof target === 'string') {
    return target.includes(field);
  }
  // Не удалось определить поле — считаем совпадением, чтобы не зациклиться
  return true;
}

export class OrderCreateController {
  /**
   * Генерация уникального номера заказа: MM05-2026-0001
   * Вызывается ВНУТРИ транзакции для снижения гонки между параллельными заказами.
   */
  private static async generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MM05-${year}-`;

    const lastOrder = await tx.order.findFirst({
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
      nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Резервирование товара с защитой от перепродажи.
   *
   * ЦЕНА ВСЕГДА берётся из БД:
   *   serverPrice = base price + модификаторы конфигурации из product.configuration
   *                 + assemblyPrice (если выбрана сборка)
   * Значения price/finalPrice из тела запроса НЕ используются для расчёта.
   */
  private static async reserveStock(
    items: CreateOrderInput['items'],
    tx: Prisma.TransactionClient
  ): Promise<ReservedOrderItem[]> {
    const reservedItems: ReservedOrderItem[] = [];

    // Единый порядок захвата строк: две корзины с теми же товарами в разном
    // порядке иначе берут блокировки навстречу друг другу и получают 40P01
    // (deadlock), который не ретраится и превращается в 500 на оформлении.
    const orderedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));

    for (const item of orderedItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stockQuantity: true,
          isActive: true,
          assemblyPrice: true,
          configuration: true,
        },
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

      // Уменьшаем остаток (резервируем) — атомарно при условии достаточного стока
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

      // Серверный расчёт цены позиции: базовая цена из БД + конфигурация + сборка
      const options = (item.options && typeof item.options === 'object')
        ? item.options as Record<string, unknown>
        : {};
      const assemblySelected = options.assembly === true;
      const assemblyPrice = assemblySelected && product.assemblyPrice
        ? Number(product.assemblyPrice)
        : 0;

      const configuredPrice = calculateServerItemPrice(
        Number(product.price),
        product.configuration,
        item.configuration
      );

      const serverPrice = configuredPrice + assemblyPrice;

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
          // Ключ идемпотентности приходит от клиента и не является секретом:
          // по нему нельзя отдавать заказ другого человека (имя, телефон,
          // адрес, состав). Сверяем владельца и телефон покупателя.
          const sameBuyer =
            (existingOrder.userId ?? null) === userId &&
            existingOrder.customerPhone === validatedData.customerPhone;

          if (!sameBuyer) {
            res.status(409).json({
              success: false,
              error: 'Конфликт ключа идемпотентности. Обновите страницу и попробуйте снова.',
            });
            return;
          }

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

      // Выполняем всё в транзакции для атомарности.
      // При гонке номеров заказа (P2002 по order_number) повторяем транзакцию
      // — номер будет перегенерирован на основе актуального состояния БД.
      let attempt = 0;
      let order: Prisma.OrderGetPayload<{ include: { items: { include: { product: true } } } }> | null = null;

      while (attempt < MAX_ORDER_NUMBER_RETRIES) {
        attempt += 1;
        try {
          order = await prisma.$transaction(async (tx) => {
            // 1. Резервируем товар (с проверкой наличия и серверным расчётом цен)
            const reservedItems = await OrderCreateController.reserveStock(validatedData.items, tx);
            const serverTotal = reservedItems.reduce((sum, item) => sum + item.lineTotal, 0);

            // Клиентская сумма используется только как sanity-check (защита от багов UI),
            // но расчёт всегда серверный
            if (Math.abs(serverTotal - validatedData.totalPrice) > 0.01) {
              throw new Error('Итоговая сумма заказа не совпадает с актуальными ценами');
            }

            // 2. Генерируем номер внутри транзакции
            const orderNumber = await OrderCreateController.generateOrderNumber(tx);

            // 3. Создаем заказ
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

            // 4. Создаем позиции заказа со снимком цены на момент покупки
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

            // 5. Получаем полный заказ с позициями
            return await tx.order.findUniqueOrThrow({
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
          break;
        } catch (txError) {
          // Параллельный дубль с тем же ключом идемпотентности: транзакция
          // проиграла гонку на уникальном индексе — отдаём уже созданный заказ
          // тому же покупателю вместо 500.
          if (isUniqueConstraintError(txError, 'idempotency_key') && validatedData.idempotencyKey) {
            const duplicate = await prisma.order.findUnique({
              where: { idempotencyKey: validatedData.idempotencyKey },
              include: { items: { include: { product: true } } },
            });

            if (duplicate) {
              const sameBuyer =
                (duplicate.userId ?? null) === userId &&
                duplicate.customerPhone === validatedData.customerPhone;

              if (sameBuyer) {
                res.status(200).json({
                  success: true,
                  message: 'Заказ уже создан',
                  data: {
                    order: duplicate,
                    whatsappUrl: OrderCreateController.generateWhatsAppUrl(duplicate),
                  },
                });
                return;
              }

              res.status(409).json({
                success: false,
                error: 'Конфликт ключа идемпотентности. Обновите страницу и попробуйте снова.',
              });
              return;
            }
          }

          const isOrderNumberRace =
            isUniqueConstraintError(txError, 'order_number') ||
            (txError instanceof Error && txError.message.includes('Итоговая сумма'));

          // Гонку номеров ретраим, ошибку суммы клиенту отдаём сразу (это бизнес-ошибка)
          if (txError instanceof Error && txError.message.includes('Итоговая сумма')) {
            throw txError;
          }
          if (isOrderNumberRace && attempt < MAX_ORDER_NUMBER_RETRIES) {
            continue;
          }
          throw txError;
        }
      }

      if (!order) {
        throw new Error('Не удалось создать заказ');
      }

      // Логируем успешное создание заказа
      console.log(`✅ Order created: ${order.orderNumber}, Total: ${order.total} ₽`);

      // Отправляем email подтверждение (если email указан)
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
              name: getProductSnapshotName(item.productSnapshot) || item.product?.name || 'Товар',
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
          whatsappUrl: OrderCreateController.generateWhatsAppUrl(order),
        },
      });
    } catch (error: unknown) {
      console.error('❌ Order creation error:', error);
      captureError(error instanceof Error ? error : new Error('Order creation failed'));

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

      // Обработка ошибок недостатка товара (безопасны для показа пользователю)
      if (error instanceof Error && error.message.includes('Недостаточно товара')) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Расхождение суммы — бизнес-ошибка ценообразования
      if (error instanceof Error && error.message.includes('Итоговая сумма')) {
        res.status(409).json({
          success: false,
          error: 'Цены товаров изменились. Обновите корзину и попробуйте снова.',
        });
        return;
      }

      // Общая ошибка: детали наружу не отдаём (утечка внутренних данных)
      res.status(500).json({
        success: false,
        error: 'Не удалось создать заказ. Попробуйте позже.',
      });
    }
  }

  /**
   * Генерация ссылки для WhatsApp уведомления
   */
  private static generateWhatsAppUrl(order: Prisma.OrderGetPayload<{ include: { items: { include: { product: true } } } }>): string {
    const managerPhone = process.env.MANAGER_WHATSAPP_PHONE || '79288331532';

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
   * Отмена резервирования при отмене заказа (возврат стока).
   * Используется при ручной отмене администратором и при refund.
   */
  static async releaseReservedStock(orderId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const release = async (client: Prisma.TransactionClient) => {
      const order = await client.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Заказ не найден');
      }

      if (!order.isStockReserved) {
        // Сток не резервиался — возвращать нечего
        return false;
      }

      // Возвращаем товар на склад
      for (const item of order.items) {
        if (item.productId) {
          await client.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      await client.order.update({
        where: { id: orderId },
        data: {
          isStockReserved: false,
        },
      });

      return true;
    };

    if (tx) {
      await release(tx);
    } else {
      await prisma.$transaction(release);
    }
  }

  /**
   * Отмена заказа с возвратом зарезервированного товара
   */
  static async cancelOrderAndReleaseStock(orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Заказ не найден');
      }

      await OrderCreateController.releaseReservedStock(orderId, tx);

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
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
