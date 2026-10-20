import { Request, Response } from 'express';
import { stripe, stripeService, isStripeConfigured } from '../services/stripe.service.js';
import {
  amountsEqual,
  yooKassaService,
  type YkPayment,
  YooKassaError,
} from '../services/yookassa.service.js';
import {
  DEFAULT_YOOKASSA_WEBHOOK_IPS,
  isIpAllowed,
} from '../utils/payment.helpers.js';
import { orderPaymentService } from '../services/order-payment.service.js';
import { captureError, captureMessage } from '../lib/sentry.js';
import { prisma } from '../lib/prisma.js';

function clientIp(req: Request): string {
  // app.set('trust proxy', 1): req.ip учитывает один proxy-hop (Railway/Vercel).
  // Локальные IPv4-подключения приходят как ::ffff:a.b.c.d — нормализуем.
  const ip = req.ip || req.socket.remoteAddress || '';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

export class WebhookController {
  /**
   * HTTP Handler для Stripe Webhook
   * ВАЖНО: Маршрут в express должен использовать express.raw({ type: 'application/json' })
   */
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Провайдер может быть отключён (PAYMENT_PROVIDER=YOOKASSA)
    if (!isStripeConfigured) {
      res.status(503).json({ success: false, error: 'Stripe is not configured' });
      return;
    }

    if (!signature || !webhookSecret) {
      res.status(400).json({ success: false, error: 'Missing signature or secret' });
      return;
    }

    let event;

    // 1. Криптографическая валидация
    try {
      event = stripe.webhooks.constructEvent(
        req.body, // Buffer expected here
        signature,
        webhookSecret
      );
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Unknown signature error';
      captureError(new Error(`Webhook signature verification failed: ${errMessage}`));
      res.status(400).json({ success: false, error: errMessage });
      return;
    }

    // 2. Делегирование бизнес-логики сервису
    try {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          await stripeService.processCheckoutCompleted(event.data.object as any);
          break;

        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled':
          await stripeService.processPaymentFailed(event.data.object as any);
          break;

        case 'payment_intent.succeeded':
          // Логируем, но основную работу делаем в checkout.session.completed
          console.log(`PaymentIntent succeeded: ${(event.data.object as any).id}`);
          break;

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      // 3. Возврат 200 OK в Stripe (критично для предотвращения ретраев)
      res.status(200).json({ received: true });
    } catch (error: unknown) {
      captureError(
        error instanceof Error ? error : new Error('Webhook processing failure'),
        { eventType: event.type }
      );
      // Возвращаем 500 только в случае критического сбоя БД, чтобы Stripe повторил отправку вебхука
      res.status(500).json({ success: false, error: 'Internal server error processing webhook' });
    }
  }

  /**
   * HTTP Handler для вебхуков ЮKassa (payment.succeeded / payment.canceled).
   *
   * Модель безопасности ЮKassa (в отличие от Stripe) — без HMAC-подписи:
   *  1. IP-allowlist официальных сетей уведомлений;
   *  2. статус НИКОГДА не берётся из тела уведомления — платёж повторно
   *     запрашивается аутентифицированным GET /v3/payments/{id};
   *  3. сумма платежа сверяется с total из нашей БД (защита от подмены);
   *  4. переход заказа выполняется идемпотентно (orderPaymentService),
   *     поэтому ретраи вебхука не задваивают оплату/склад/письма.
   *
   * Маршрут в express должен использовать express.raw({ type: 'application/json' }).
   */
  static async handleYookassaWebhook(req: Request, res: Response): Promise<void> {
    // 1. IP-allowlist
    const allowlist = process.env.YOOKASSA_WEBHOOK_IPS
      ? process.env.YOOKASSA_WEBHOOK_IPS.split(',').map(s => s.trim()).filter(Boolean)
      : DEFAULT_YOOKASSA_WEBHOOK_IPS;

    const ip = clientIp(req);
    if (!isIpAllowed(ip, allowlist)) {
      captureError(new Error(`YooKassa webhook rejected: untrusted IP ${ip}`));
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    // 2. Разбор тела
    let notification: { event?: string; object?: { id?: string } };
    try {
      const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body ?? '');
      notification = JSON.parse(raw);
    } catch {
      res.status(400).json({ success: false, error: 'Invalid JSON' });
      return;
    }

    const paymentId = notification.object?.id;
    if (!paymentId || typeof paymentId !== 'string') {
      res.status(400).json({ success: false, error: 'Missing payment id' });
      return;
    }

    if (!['payment.succeeded', 'payment.canceled'].includes(notification.event || '')) {
      // Прочие события (refund.*, payout.*) принимаем молча — ретраи не нужны
      res.status(200).json({ received: true });
      return;
    }

    // 3. Серверная верификация: платёж запрашивается у API, не из тела вебхука
    let payment: YkPayment;
    try {
      payment = await yooKassaService.getPayment(paymentId);
    } catch (error) {
      captureError(
        error instanceof YooKassaError ? error : new Error('YooKassa verification fetch failed'),
        { paymentId, event: notification.event }
      );
      // Провайдер недоступен/ошибка API → 500, чтобы ЮKassa повторила доставку
      res.status(500).json({ success: false, error: 'Verification failed' });
      return;
    }

    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      captureMessage(`YooKassa webhook payment ${paymentId} has no orderId in metadata`, 'warning');
      res.status(200).json({ received: true });
      return;
    }

    // 4. Применение результата (идемпотентно)
    try {
      if (payment.status === 'succeeded') {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { total: true },
        });

        if (!order) {
          captureMessage(`YooKassa success for unknown order ${orderId}`, 'warning');
          res.status(200).json({ received: true });
          return;
        }

        // Защита от подмены суммы: сверяем с нашим total
        if (!amountsEqual(payment.amount.value, Number(order.total))) {
          captureError(
            new Error(
              `YooKassa amount mismatch for order ${orderId}: paid ${payment.amount.value}, expected ${order.total}`
            )
          );
          res.status(200).json({ received: true }); // не ретраим: данные расходятся намеренно
          return;
        }

        await orderPaymentService.fulfillPaidOrder({
          orderId,
          provider: 'YOOKASSA',
          externalPaymentId: payment.id,
        });
      } else if (payment.status === 'canceled') {
        await orderPaymentService.failOrder(orderId, 'YOOKASSA');
      } else {
        // pending / waiting_for_capture — промежуточные статусы, ничего не делаем
      }

      res.status(200).json({ received: true });
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('YooKassa webhook processing failure'),
        { orderId, paymentId }
      );
      // Сбой БД → 500, чтобы ЮKassa повторила отправку
      res.status(500).json({ success: false, error: 'Internal server error processing webhook' });
    }
  }
}
