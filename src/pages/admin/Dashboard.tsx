import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import api from "@/services/api";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/stats");
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить статистику");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  const statCards = [
    {
      title: "Товары",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/products",
    },
    {
      title: "Заказы",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/orders",
    },
    {
      title: "Клиенты",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/users",
    },
    {
      title: "Выручка",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/admin/analytics",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-2">Панель управления</h1>
          <p className="text-muted-foreground">
            Добро пожаловать в админ-панель MM05
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-muted-foreground text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold">{card.value}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Последняя активность
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Новых заказов в ожидании</span>
                <span className="font-semibold text-accent">{stats.pendingOrders}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Быстрые действия</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/products/new"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-medium text-sm transition-colors"
              >
                <Package className="w-4 h-4" />
                Добавить товар
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-muted border border-border rounded-lg font-medium text-sm transition-colors"
              >
                <ShoppingBag className="w-4 h-4 stroke-2" aria-hidden="true" />
                Заказы
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-muted border border-border rounded-lg font-medium text-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                Клиенты
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-muted border border-border rounded-lg font-medium text-sm transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                Настройки
              </Link>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.pendingOrders > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 mb-1">
                Внимание: есть новые заказы
              </p>
              <p className="text-sm text-orange-700">
                {stats.pendingOrders} заказов ожидают обработки.{" "}
                <Link to="/admin/orders" className="underline font-medium">
                  Проверить заказы
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
