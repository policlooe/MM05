import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch stats from API
    // Временные данные для демонстрации
    setTimeout(() => {
      setStats({
        totalProducts: 8,
        totalOrders: 45,
        totalCustomers: 120,
        totalRevenue: 2450000,
        recentOrders: 12,
        lowStockProducts: 2,
      });
      setLoading(false);
    }, 500);
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
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/orders",
    },
    {
      title: "Клиенты",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/customers",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-6 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-2">Панель управления</h1>
          <p className="text-muted-foreground">
            Добро пожаловать в админ-панель MM05
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all"
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
                <span className="text-sm">Новых заказов за сегодня</span>
                <span className="font-semibold text-accent">{stats.recentOrders}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Товаров с низким остатком</span>
                <span className="font-semibold text-orange-600">{stats.lowStockProducts}</span>
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
                <ShoppingCart className="w-4 h-4" />
                Заказы
              </Link>
              <Link
                to="/admin/customers"
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
        {stats.lowStockProducts > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 mb-1">
                Внимание: низкий остаток товаров
              </p>
              <p className="text-sm text-orange-700">
                У {stats.lowStockProducts} товаров заканчивается остаток на складе.{" "}
                <Link to="/admin/products" className="underline font-medium">
                  Проверить товары
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
