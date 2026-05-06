import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Home, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ChatLauncher } from '@/components/ChatLauncher';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-12 pb-24 md:pb-10">
        <div className="max-w-2xl mx-auto">
          <Breadcrumbs />
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl font-semibold mb-3">Оплата успешна!</h1>
            <p className="text-muted-foreground">
              Ваш заказ успешно оплачен и принят в обработку
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Package className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="font-semibold text-lg mb-2">Что дальше?</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Мы отправили подтверждение на вашу электронную почту</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей доставки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Вы можете отслеживать статус заказа в личном кабинете</span>
                  </li>
                </ul>
              </div>
            </div>

            {sessionId && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  ID сессии: <span className="font-mono">{sessionId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/catalog"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-surface hover:bg-muted border border-border rounded-lg font-semibold text-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Продолжить покупки
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              На главную
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Возникли вопросы?
            </p>
            <a
              href="https://wa.me/79288331532"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover font-semibold text-sm"
            >
              Напишите нам в WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
