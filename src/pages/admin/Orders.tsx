import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Eye, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';
import {
  ORDER_STATUS_FLOW,
  formatMoney,
  orderStatusColor,
  orderStatusLabel,
  paymentStatusLabel,
} from '@/lib/order-status';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  customerName: string;
  customerEmail?: string | null;
  createdAt: string;
  _count?: { items: number };
  user?: {
    fullName?: string | null;
    email: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? 'all';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Дебаунс поиска: не дёргаем API на каждый символ
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/orders', {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(search ? { search } : {}),
        },
      });

      setOrders(response.data.data as Order[]);
      setPagination(response.data.pagination as Pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Не удалось загрузить заказы. Проверьте соединение с API.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const updateParams = (next: { status?: string; page?: number; search?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.status !== undefined) {
      if (next.status === 'all') params.delete('status');
      else params.set('status', next.status);
      params.delete('page');
    }

    if (next.page !== undefined) {
      if (next.page <= 1) params.delete('page');
      else params.set('page', String(next.page));
    }

    if (next.search !== undefined) {
      if (!next.search) params.delete('search');
      else params.set('search', next.search);
      params.delete('page');
    }

    setSearchParams(params, { replace: true });
  };

  // Поиск меняется дебаунсом — синхронизируем URL, чтобы ссылку можно было сохранить
  useEffect(() => {
    if ((searchParams.get('search') ?? '') !== search) {
      updateParams({ search });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const rangeFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Заказы</h1>
            <p className="text-muted-foreground mt-1">
              {pagination.total > 0 ? `Всего: ${pagination.total}` : 'Управление заказами клиентов'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Номер заказа, имя, телефон или email..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pl-10"
              aria-label="Поиск заказов"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => updateParams({ status: value })}
          >
            <SelectTrigger className="w-full md:w-[240px]" aria-label="Фильтр по статусу">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {ORDER_STATUS_FLOW.map((status) => (
                <SelectItem key={status} value={status}>
                  {orderStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <button type="button" onClick={() => void fetchOrders()} className="mt-2 text-sm underline">
                Повторить
              </button>
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 rounded-lg bg-secondary animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 && !error ? (
            <div className="p-10 text-center text-muted-foreground">
              <p className="font-medium mb-1">
                {search || statusFilter !== 'all' ? 'Ничего не найдено' : 'Заказов пока нет'}
              </p>
              <p className="text-sm">
                {search || statusFilter !== 'all'
                  ? 'Измените поиск или сбросьте фильтр статуса.'
                  : 'Как только покупатель оформит заказ, он появится здесь.'}
              </p>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Номер</th>
                    <th scope="col" className="px-4 py-3 font-medium">Клиент</th>
                    <th scope="col" className="px-4 py-3 font-medium">Позиций</th>
                    <th scope="col" className="px-4 py-3 font-medium">Сумма</th>
                    <th scope="col" className="px-4 py-3 font-medium">Статус</th>
                    <th scope="col" className="px-4 py-3 font-medium">Оплата</th>
                    <th scope="col" className="px-4 py-3 font-medium">Создан</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-border/60 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail || order.user?.email || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order._count?.items ?? 0}</td>
                      <td className="px-4 py-3 font-semibold">{formatMoney(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge className={orderStatusColor(order.status)}>
                          {orderStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {paymentStatusLabel(order.paymentStatus)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(order.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-accent hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {rangeFrom}–{rangeTo} из {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateParams({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Назад
              </button>
              <span className="text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => updateParams({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
