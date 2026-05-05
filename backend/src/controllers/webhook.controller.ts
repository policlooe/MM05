import { Request, Response } from 'express';
import { stripe, stripeService } from '../services/stripe.service';
import { captureError } from '../lib/sentry';

export class WebhookController {
  /**
   * HTTP Handler для Stripe Webhook
   * ВАЖНО: Маршрут в express должен использовать express.raw({ type: 'application/json' })
   */
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
        case 'payment_intent.payment_failed':
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
}
