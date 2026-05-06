import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ChatLauncher } from '@/components/ChatLauncher';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-12 pb-24 md:pb-10">
        <div className="max-w-md mx-auto">
          <Breadcrumbs />
          <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Оплата отменена</CardTitle>
          <CardDescription>
            Вы отменили процесс оплаты. Ваш заказ не был оплачен.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Если у вас возникли проблемы с оплатой или вопросы, 
                пожалуйста, свяжитесь с нашим менеджером.
              </span>
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Способы связи:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>📞 Телефон: +7 928 833-15-32</li>
              <li>💬 WhatsApp: +7 928 833-15-32</li>
              <li>📱 Telegram: @mm05_mebel</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            {orderId && (
              <Link to="/payment" state={{ orderId }} className="w-full">
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Попробовать снова
                </Button>
              </Link>
            )}
            <Link to="/catalog" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к покупкам
              </Button>
            </Link>
            <Link to="/" className="w-full">
              <Button variant="ghost" className="w-full">
                На главную
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
