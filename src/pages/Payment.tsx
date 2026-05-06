import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Loader2, ShoppingCart, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatLauncher } from "@/components/ChatLauncher";
import { MobileNav } from "@/components/MobileNav";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCart, formatPrice } from "@/store/cart";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";

export default function Payment() {
  const navigate = useNavigate();
  const { items, total, count } = useCart();
  const [loading, setLoading] = useState(false);

  // Прокрутка вверх при открытии страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (count === 0 && !loading) {
      toast.error("Корзина пуста");
      navigate("/");
    }
  }, [count, loading, navigate]);

  const handleStripeCheckout = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      toast.error("Войдите в аккаунт для оформления заказа");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      await paymentService.checkoutAndRedirect();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || "Не удалось создать сессию оплаты");
      setLoading(false);
    }
  };

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
          Безопасная оплата через Stripe. Принимаем карты Visa, Mastercard, МИР.
        </p>

        {/* Товары в корзине */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
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
          <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <CreditCard className="w-6 h-6 text-accent" />
            <div>
              <p className="font-semibold text-sm">Банковская карта</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, МИР</p>
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
                Оплата проходит через защищённый сервис Stripe. Мы не храним данные вашей карты.
                Все транзакции защищены по стандарту PCI DSS.
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
      <Footer />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
