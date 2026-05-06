import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  revenue: {
    total: number;
    byMonth: Array<{ month: string; amount: number }>;
  };
  orders: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  products: {
    topSelling: Array<{ name: string; sales: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
  users: {
    total: number;
    newThisMonth: number;
  };
}

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      setData(response.data.data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аналитику',
        variant: 'destructive',
      });
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

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Общая выручка',
      value: `${(data.revenue.total / 100).toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Всего заказов',
      value: data.orders.total,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Пользователей',
      value: data.users.total,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Новых за месяц',
      value: data.users.newThisMonth,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Аналитика</h1>
            <p className="text-muted-foreground mt-1">
              Статистика и отчеты по продажам
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'week'
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border hover:bg-muted'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'month'
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border hover:bg-muted'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'year'
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border hover:bg-muted'
              }`}
            >
              Год
            </button>
          </div>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* График выручки */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Выручка по месяцам</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="month" stroke="#6E6E73" />
              <YAxis stroke="#6E6E73" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22C55E"
                strokeWidth={2}
                name="Выручка (₽)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Топ товаров */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Топ товаров</h2>
            </div>

            <div className="space-y-4">
              {data.products.topSelling.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} продаж
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">
                    {(product.revenue / 100).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Заказы по статусам */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Заказы по статусам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.orders.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.orders.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Товары по категориям */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Товары по категориям</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.products.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="category" stroke="#6E6E73" />
              <YAxis stroke="#6E6E73" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#22C55E" name="Количество товаров" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
