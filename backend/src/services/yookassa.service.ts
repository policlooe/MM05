import { randomUUID } from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { captureError } from '../lib/sentry.js';
import {
  amountsEqual,
  toYkAmount,
  ykStatusToPaymentStatus,
  type YkPaymentStatus,
} from '../utils/payment.helpers.js';

export { amountsEqual, toYkAmount, ykStatusToPaymentStatus };

/**
 * Адаптер ЮKassa (официальный API v3) со способом оплаты СБП.
 *
 * Безопасность (требование инструкции п.8):
 *  - секретный ключ только на сервере, фронт получает только confirmation_url;
 *  - Idempotence-Key сохраняется в orders.idempotency_key ДО запроса,
 *    поэтому повторное создание платежа по тому же заказу не задвоит оплату;
 *  - статус оплаты никогда не берётся из тела вебхука на веру:
 *    контроллер повторно запрашивает платёж аутентифицированным GET.
 */

const DEFAULT_API_URL = 'https://api.yookassa.ru/v3';

export interface YkAmount {
  value: string;
  currency: string;
}

export interface YkConfirmation {
  type: string;
  confirmation_url?: string;
}

export interface YkPayment {
  id: string;
  status: YkPaymentStatus;
  paid: boolean;
  amount: YkAmount;
  description?: string;
  metadata?: Record<string, string>;
  confirmation?: YkConfirmation;
}

export class YooKassaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public description?: string
  ) {
    super(message);
    this.name = 'YooKassaError';
  }
}

export class YooKassaService {
  private get shopId(): string | undefined {
    return process.env.YOOKASSA_SHOP_ID;
  }

  private get secretKey(): string | undefined {
    return process.env.YOOKASSA_SECRET_KEY;
  }

  private get apiUrl(): string {
    return (process.env.YOOKASSA_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return Boolean(this.shopId && this.secretKey);
  }

  private authHeader(): string {
    if (!this.shopId || !this.secretKey) {
      throw new YooKassaError('YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY are not configured');
    }
    return `Basic ${Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64')}`;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    options: { idempotenceKey?: string; body?: unknown } = {}
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
        ...(options.idempotenceKey ? { 'Idempotence-Key': options.idempotenceKey } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: AbortSignal.timeout(15_000),
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { description?: string }) : ({} as T);

    if (!response.ok) {
      const description = (data as { description?: string }).description;
      throw new YooKassaError(
        `YooKassa API error ${response.status} on ${method} ${path}`,
        response.status,
        description
      );
    }

    return data;
  }

  async getPayment(paymentId: string): Promise<YkPayment> {
    if (!/^[0-9a-f-]{20,}$/i.test(paymentId)) {
      // id ЮKassa — длинный uuid-like идентификатор; отсекаем инъекции в путь
      throw new YooKassaError('Malformed YooKassa payment id');
    }
    return this.request<YkPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`);
  }

  /**
   * Создать СБП-платёж для заказа. Идемпотентность:
   *  - активный (pending) платёж уже привязан к заказу → переиспользуем его,
    повторного списания не будет;
   *  - иначе создаём новый платёж со свежим Idempotence-Key и сохраняем его
   *    в orders.idempotency_key ДО запроса к провайдеру.
   *
   * Отменённый/неудачный платёж НЕ переиспользуем: тот же Idempotence-Key
   * с другим телом вернул бы кэшированный ответ провайдера, поэтому каждой
   * новой попытке оплаты соответствует новый ключ.
   */
  async createSbpPaymentForOrder(params: {
    orderId: string;
    orderNumber: string;
    total: number;
    customerEmail?: string | null;
    returnUrl: string;
    description?: string;
  }): Promise<{ payment: YkPayment; reused: boolean }> {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: {
        id: true,
        paymentProvider: true,
        providerPaymentId: true,
        total: true,
      },
    });

    if (!order) {
      throw new YooKassaError(`Order ${params.orderId} not found`);
    }

    // Повторная попытка оплаты: возвращаем существующий активный платёж
    if (order.paymentProvider === 'YOOKASSA' && order.providerPaymentId) {
      try {
        const existing = await this.getPayment(order.providerPaymentId);
        if (existing.status === 'pending' || existing.status === 'waiting_for_capture') {
          return { payment: existing, reused: true };
        }
        if (existing.status === 'succeeded') {
          throw new YooKassaError('Payment already succeeded for this order');
        }
        // canceled — создаём новую попытку ниже
      } catch (error) {
        if (
          error instanceof YooKassaError &&
          error.message.includes('already succeeded')
        ) {
          throw error;
        }
        // платёж недоступен у провайдера — создадим новый ниже
      }
    }

    const body = {
      amount: { value: toYkAmount(params.total), currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: params.returnUrl },
      description: params.description || `Заказ ${params.orderNumber}`,
      metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
      payment_method_data: { type: 'sbp' },
    };

    const idempotenceKey = randomUUID();

    try {
      const payment = await this.request<YkPayment>('POST', '/payments', {
        idempotenceKey,
        body,
      });

      await prisma.order.update({
        where: { id: params.orderId },
        data: {
          paymentProvider: 'YOOKASSA',
          providerPaymentId: payment.id,
          idempotencyKey: idempotenceKey,
          stripeSessionId: null,
          paymentStatus: ykStatusToPaymentStatus(payment.status),
        },
      });

      return { payment, reused: false };
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('YooKassa create payment failed'), {
        orderId: params.orderId,
      });
      throw error;
    }
  }
}

export const yooKassaService = new YooKassaService();
