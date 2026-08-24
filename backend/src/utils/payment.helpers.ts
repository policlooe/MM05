import { PaymentStatus } from '@prisma/client';

/**
 * Чистые хелперы платёжного контура (без I/O) — покрываются юнит-тестами.
 */

/** Официальные сети уведомлений ЮKassa. Переопределяется YOOKASSA_WEBHOOK_IPS (csv, IPv4/CIDR). */
export const DEFAULT_YOOKASSA_WEBHOOK_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11/32',
  '77.75.156.35/32',
  '77.75.154.128/25',
];

export type YkPaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';

/** IPv4 → число; null для невалидных строк */
export function ipToLong(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255 || !/^\d+$/.test(part)) return null;
    result = result * 256 + n;
  }
  return result;
}

/** Проверка IPv4-адреса по списку одиночных адресов и CIDR-подсетей */
export function isIpAllowed(ip: string, allowlist: string[]): boolean {
  const ipLong = ipToLong(ip);
  if (ipLong === null) return false;

  return allowlist.some((entry) => {
    const [network, prefixStr] = entry.split('/');
    const networkLong = ipToLong(network);
    if (networkLong === null) return false;

    // Без префикса — точное совпадение адреса
    if (prefixStr === undefined) return networkLong === ipLong;

    const prefix = Number(prefixStr);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;

    // Маска подсети: /0 → 0 (всё разрешено), /32 → 0xffffffff (только сам адрес)
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (networkLong & mask) === (ipLong & mask);
  });
}

/** Число → строка суммы формата ЮKassa ("1234.50", всегда 2 знака); бросает при <= 0 / NaN */
export function toYkAmount(amount: number): string {
  const kopecks = Math.round(amount * 100);
  if (!Number.isFinite(kopecks) || kopecks <= 0) {
    throw new RangeError(`Invalid payment amount: ${amount}`);
  }
  return (kopecks / 100).toFixed(2);
}

/** Суммы равны с точностью до копейки независимо от формата входа */
export function amountsEqual(a: string | number, b: string | number): boolean {
  // Пустая строка/пробелы коэрсятся в 0 — отсекаем до Number()
  if (typeof a === 'string' && a.trim() === '') return false;
  if (typeof b === 'string' && b.trim() === '') return false;

  const pa = Math.round(Number(a) * 100);
  const pb = Math.round(Number(b) * 100);
  return Number.isFinite(pa) && Number.isFinite(pb) && pa === pb;
}

/** Маппинг статусов ЮKassa → внутренние PaymentStatus */
export function ykStatusToPaymentStatus(status: YkPaymentStatus): PaymentStatus {
  switch (status) {
    case 'succeeded':
      return PaymentStatus.SUCCEEDED;
    case 'canceled':
      return PaymentStatus.FAILED;
    case 'waiting_for_capture':
    case 'pending':
      return PaymentStatus.PROCESSING;
  }
}
