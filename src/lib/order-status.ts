/** Единые подписи и цвета статусов заказа для админки. */

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  RESERVED: 'Зарезервирован',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-yellow-500/10 text-yellow-700',
  RESERVED: 'bg-amber-500/10 text-amber-700',
  CONFIRMED: 'bg-blue-500/10 text-blue-700',
  PROCESSING: 'bg-purple-500/10 text-purple-700',
  SHIPPED: 'bg-indigo-500/10 text-indigo-700',
  DELIVERED: 'bg-green-500/10 text-green-700',
  COMPLETED: 'bg-emerald-500/10 text-emerald-700',
  CANCELLED: 'bg-red-500/10 text-red-700',
};

export const ORDER_STATUS_FLOW = [
  'RESERVED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PROCESSING: 'Платёж в обработке',
  SUCCEEDED: 'Оплачен',
  FAILED: 'Не оплачен',
  REFUNDED: 'Возврат',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function formatMoney(value: number | string): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(
    Number.isFinite(numeric) ? numeric : 0
  ) + ' ₽';
}
