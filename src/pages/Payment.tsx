import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ChevronLeft, CreditCard, Loader2, ShoppingBag, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCart, formatPrice } from "@/store/cart";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";

// Lazy load heavy components
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatLauncher = lazy(() => import("@/components/ChatLauncher").then(m => ({ default: m.ChatLauncher })));

interface RetryState {
  orderId?: string;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { items, total, count } = useCart();
  const [loading, setLoading] = useState(false);

  // Повторная оплата существующего заказа (возврат со страницы отмены):
  // новый заказ НЕ создаём — переиспользуем orderId
  const retryOrderId =
    (location.state as RetryState | null)?.orderId || searchParams.get("order_id") || "";

  // Прокрутка вверх при открытии страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if cart is empty (не относится к повторной оплате)
  useEffect(() => {
    if (count === 0 && !loading && !retryOrderId) {
      toast.error("Корзина пуста");
      navigate("/");
    }
  }, [count, loading, navigate, retryOrderId]);

  const startPaymentFor = async (orderId: string) => {
    try {
      setLoading(true);
      const session = await paymentService.createCheckoutSession(orderId);
      await paymentService.redirectToCheckout(session.data.url, session.data.provider);
      // При успехе редирект уводит со страницы; loading остаётся до размонтирования
    } catch (error) {
      console.error('Retry payment error:', error);
      toast.error(error instanceof Error ? error.message : "Не удалось создать сессию оплаты");
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    // Проверяем наличие пользователя в localStorage
    const user = localStorage.getItem('user');

    if (!user) {
      toast.error("Войдите в аккаунт для оформления заказа");
      navigate("/login");
      return;
    }

    if (retryOrderId) {
      await startPaymentFor(retryOrderId);
      return;
    }

    toast.error("Сначала оформите заказ с адресом доставки");
    navigate("/checkout");
  };

  // Повторная оплата: корзина не нужна, показываем компактную карточку
  if (retryOrderId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-x py-12 pb-24 md:pb-10 max-w-md">
          <Breadcrumbs />
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <CreditCard className="w-10 h-10 text-accent mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-semibold mb-2">Повторная оплата</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Заказ ещё ждёт оплаты. Вы можете завершить платёж — товары зарезервированы за вами.
            </p>
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground py-4 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Создание сессии оплаты...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Перейти к оплате
                </>
              )}
            </button>
            <Link
              to="/catalog"
              className="block mt-3 w-full py-3 rounded-lg font-semibold text-sm border border-border hover:bg-muted transition-colors"
            >
              Вернуться к покупкам
            </Link>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-6 pb-24 md:pb-10 max-w-2xl">
        <Breadcrumbs />

        <h1 className="font-serif text-3xl font-semibold mb-2">Оформление заказа</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Безопасная оплата: СБП (по QR-коду из приложения банка) или банковская карта.
        </p>

        {/* Товары в корзине */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
            Ваш заказ ({count} {count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'})
          </h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.qty} × {formatPrice(item.finalPrice)}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.qty * item.finalPrice)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="font-semibold">Итого:</span>
            <span className="text-xl font-bold text-accent">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Информация об оплате */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <h2 className="font-semibold text-sm mb-3 text-muted-foreground">Способ оплаты</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-accent" />
              <div>
                <p className="font-semibold text-sm">СБП — система быстрых платежей</p>
                <p className="text-xs text-muted-foreground">Оплата по QR-коду через приложение вашего банка</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg opacity-70">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm">Банковская карта</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, МИР</p>
              </div>
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-5">
          <div className="flex items-start gap-3 text-sm">
            <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-2">Безопасная оплата</p>
              <p className="text-muted-foreground leading-relaxed">
                Оплата проходит через защищённые платёжные сервисы. Мы не получаем и не храним
                данные вашей карты. Все транзакции защищены по стандарту PCI DSS.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button
          onClick={handleStripeCheckout}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground py-4 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Создание сессии оплаты...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Перейти к оплате {formatPrice(total)}
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
        </p>
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
      <MobileNav />
      <Suspense fallback={null}>
        <ChatLauncher />
      </Suspense>
    </div>
  );
}
