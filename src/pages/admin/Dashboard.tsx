import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import api from "@/services/api";
import { formatMoney, orderStatusColor, orderStatusLabel } from "@/lib/order-status";

type Period = "week" | "month" | "year";

interface StatusBreakdownItem {
  status: string;
  count: number;
}

interface TopProduct {
  id: string | null;
  name: string;
  slug: string | null;
  quantity: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stockQuantity: number;
}

interface DashboardStats {
  period: { from: string; to: string; type: string };
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  averageOrderValue: number;
  statusBreakdown: StatusBreakdownItem[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  lowStock: LowStockProduct[];
}

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: "week", label: "7 дней" },
  { value: "month", label: "30 дней" },
  { value: "year", label: "Год" },
];

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (nextPeriod: Period) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/stats", { params: { period: nextPeriod } });
      setStats(response.data.data as DashboardStats);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить статистику. Проверьте, что API доступен.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats(period);
  }, [fetchStats, period]);

  const statusTotal = useMemo(
    () => (stats?.statusBreakdown ?? []).reduce((sum, item) => sum + item.count, 0),
    [stats]
  );

  const cards = stats
    ? [
        {
          title: "Выручка за период",
          value: formatMoney(stats.totalRevenue),
          hint: `${stats.paidOrders} оплаченных заказов`,
          icon: Wallet,
          tone: "text-emerald-600 bg-emerald-50",
          link: "/admin/orders",
        },
        {
          title: "Заказы",
          value: stats.totalOrders,
          hint: `в ожидании: ${stats.pendingOrders}`,
          icon: ShoppingBag,
          tone: "text-blue-600 bg-blue-50",
          link: "/admin/orders",
        },
        {
          title: "Средний чек",
          value: formatMoney(stats.averageOrderValue),
          hint: "по оплаченным заказам",
          icon: ReceiptText,
          tone: "text-amber-600 bg-amber-50",
          link: "/admin/orders",
        },
        {
          title: "Клиенты",
          value: stats.totalUsers,
          hint: `новых за период`,
          icon: Users,
          tone: "text-purple-600 bg-purple-50",
          link: "/admin/users",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-2">Панель управления</h1>
            <p className="text-muted-foreground">Заказы, выручка и остатки магазина</p>
          </div>

          <div className="flex items-center gap-2" role="group" aria-label="Период статистики">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPeriod(item.value)}
                aria-pressed={period === item.value}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  period === item.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-surface border-border hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void fetchStats(period)}
              className="p-2 rounded-lg border border-border hover:bg-muted"
              aria-label="Обновить статистику"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={() => void fetchStats(period)}
                className="mt-2 text-sm underline"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {loading && !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 rounded-xl border border-border bg-surface animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.link}
                    className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition"
                  >
                    <div className={`${card.tone} p-3 rounded-lg w-fit mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-muted-foreground text-sm mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.hint}</p>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <section className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Заказы по статусам
                </h2>

                {statusTotal === 0 ? (
                  <p className="text-sm text-muted-foreground">За выбранный период заказов нет.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.statusBreakdown
                      .slice()
                      .sort((a, b) => b.count - a.count)
                      .map((item) => (
                        <li key={item.status}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{orderStatusLabel(item.status)}</span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${Math.round((item.count / statusTotal) * 100)}%` }}
                            />
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </section>

              <section className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-accent" />
                  Топ товаров за период
                </h2>

                {stats.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Пока нет оплаченных продаж.</p>
                ) : (
                  <ol className="space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <li key={`${product.id}-${index}`} className="flex items-center justify-between gap-3">
                        <span className="flex-1 truncate text-sm">
                          {index + 1}. {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {product.quantity} шт.
                        </span>
                        <span className="text-sm font-semibold whitespace-nowrap">
                          {formatMoney(product.revenue)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>

            {stats.lowStock.length > 0 && (
              <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="font-semibold text-orange-900 flex items-center gap-2 mb-1">
                  <TriangleAlert className="w-5 h-5" />
                  Заканчивается на складе
                </p>
                <p className="text-sm text-orange-800">
                  {stats.lowStock
                    .map((product) => `${product.name} — ${product.stockQuantity} шт.`)
                    .join(" · ")}
                </p>
                <Link to="/admin/products" className="mt-2 inline-block text-sm underline text-orange-900">
                  Открыть товары
                </Link>
              </div>
            )}

            <section className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Последние заказы</h2>
                <Link to="/admin/orders" className="text-sm text-accent underline">
                  Все заказы
                </Link>
              </div>

              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">За период заказов не было.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th scope="col" className="py-2 pr-4 font-medium">Номер</th>
                        <th scope="col" className="py-2 pr-4 font-medium">Клиент</th>
                        <th scope="col" className="py-2 pr-4 font-medium">Сумма</th>
                        <th scope="col" className="py-2 pr-4 font-medium">Статус</th>
                        <th scope="col" className="py-2 font-medium">Создан</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4">
                            <Link to={`/admin/orders/${order.id}`} className="text-accent underline">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="py-2 pr-4">{order.customerName}</td>
                          <td className="py-2 pr-4 font-medium">{formatMoney(order.total)}</td>
                          <td className="py-2 pr-4">
                            <span className={`inline-block rounded-md px-2 py-0.5 text-xs ${orderStatusColor(order.status)}`}>
                              {orderStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {DATE_FORMAT.format(new Date(order.createdAt))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {stats.pendingOrders > 0 && (
              <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Есть заказы в работе</p>
                  <p className="text-sm text-orange-700">
                    {stats.pendingOrders} заказ(ов) ждут подтверждения или сборки.{" "}
                    <Link to="/admin/orders?status=RESERVED" className="underline font-medium">
                      Открыть
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
