import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import api from '@/services/api';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const cards = [
    {
      title: 'Всего пользователей',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Всего заказов',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Товаров',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Ожидают обработки',
      value: stats?.pendingOrders || 0,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Обзор статистики магазина</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Общая выручка</h2>
          <p className="text-4xl font-bold text-accent">
            {((stats?.totalRevenue || 0) / 100).toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Из подтвержденных и доставленных заказов
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
