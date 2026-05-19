import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product?: { name: string; slug?: string } | null;
  productSnapshot?: { name?: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  deliveryAddress: string;
  customerNote?: string | null;
  adminNote?: string | null;
  paymentStatus: string;
  user?: {
    fullName?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  NEW: 'bg-yellow-500/10 text-yellow-500',
  RESERVED: 'bg-amber-500/10 text-amber-500',
  CONFIRMED: 'bg-blue-500/10 text-blue-500',
  PROCESSING: 'bg-purple-500/10 text-purple-500',
  SHIPPED: 'bg-indigo-500/10 text-indigo-500',
  DELIVERED: 'bg-green-500/10 text-green-500',
  COMPLETED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

const statusLabels: Record<string, string> = {
  NEW: 'Новый',
  RESERVED: 'Зарезервирован',
  CONFIRMED: 'Подтвержден',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершен',
  CANCELLED: 'Отменен',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PROCESSING: 'Обрабатывается',
  SUCCEEDED: 'Оплачен',
  FAILED: 'Ошибка оплаты',
  REFUNDED: 'Возврат',
};

function itemName(item: OrderItem): string {
  return item.product?.name ?? item.productSnapshot?.name ?? 'Товар';
}

function formatMoney(value: number | string): string {
  return Number(value).toLocaleString('ru-RU') + ' ₽';
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказ',
        variant: 'destructive',
      });
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast({
        title: 'Успешно',
        description: 'Статус заказа обновлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Заказ не найден</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к заказам
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Заказ #{order.orderNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Создан {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>

          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Товары */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Товары</h2>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{itemName(item)}</p>
                      <p className="text-sm text-muted-foreground">
                        Количество: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Итого:</span>
                  <span className="text-accent">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Адрес доставки */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Адрес доставки</h2>
              </div>

              <div className="space-y-2 text-foreground">
                <p className="whitespace-pre-line">{order.deliveryAddress}</p>
              </div>
            </div>

            {/* Примечания */}
            {(order.customerNote || order.adminNote) && (
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Примечания</h2>
                {order.customerNote && <p className="text-foreground mb-2">{order.customerNote}</p>}
                {order.adminNote && (
                  <p className="text-sm text-muted-foreground">Админ: {order.adminNote}</p>
                )}
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус заказа */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Статус</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Изменить статус
                  </label>
                  <Select
                    value={order.status}
                    onValueChange={handleStatusChange}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Последнее обновление</p>
                  <p className="text-sm font-medium">
                    {format(new Date(order.updatedAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
              </div>
            </div>

            {/* Информация о клиенте */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Клиент</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail ?? order.user?.email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Оплата */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Оплата</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Статус оплаты</p>
                  <Badge
                    className={
                      order.paymentStatus === 'SUCCEEDED'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }
                  >
                    {paymentStatusLabels[order.paymentStatus]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
