import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, FileText, MessageCircle, Home, Printer } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { formatPrice } from "@/store/cart";
import { motion } from "framer-motion";
import { ecommerce } from "@/lib/web-vitals";

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, whatsappUrl } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track purchase event
    if (order) {
      ecommerce.purchase(
        order.orderNumber,
        order.items.map((item: any) => ({
          id: item.product?.id || item.productId,
          name: item.product?.name || 'Товар',
          price: Number(item.price),
          quantity: item.quantity,
        })),
        Number(order.total)
      );
    }
  }, []);

  // Redirect if no order data
  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const handlePrintInvoice = () => {
    const invoiceUrl = `${import.meta.env.VITE_API_URL}/orders/${order.id}/invoice`;
    window.open(invoiceUrl, "_blank");
  };

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-10 pb-24 md:pb-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Иконка успеха */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </motion.div>

          {/* Заголовок */}
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3">
            Заказ успешно оформлен!
          </h1>
          <p className="text-muted-foreground mb-2">
            Номер вашего заказа:
          </p>
          <p className="text-2xl font-bold text-accent mb-6">
            {order.orderNumber}
          </p>

          {/* Информация о заказе */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6 text-left">
            <h2 className="font-semibold text-lg mb-4">Детали заказа</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дата:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Получатель:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон:</span>
                <span className="font-medium">{order.customerPhone}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Адрес:</span>
                <span className="font-medium text-right max-w-[60%]">
                  {order.deliveryAddress}
                </span>
              </div>
              
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground">Сумма заказа:</span>
                <span className="text-xl font-bold text-accent">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </div>

          {/* Товары */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6 text-left">
            <h2 className="font-semibold text-lg mb-4">Товары ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product?.name || 'Товар'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(Number(item.price))}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(Number(item.total))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Что дальше? */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6 text-left">
            <h2 className="font-semibold text-lg mb-3">Что дальше?</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent shrink-0">1.</span>
                <span>Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent shrink-0">2.</span>
                <span>Мы уточним детали доставки и способ оплаты</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-accent shrink-0">3.</span>
                <span>После подтверждения мы подготовим ваш заказ к отправке</span>
              </li>
            </ol>
          </div>

          {/* Действия */}
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <motion.button
              onClick={handlePrintInvoice}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 bg-surface hover:bg-muted border border-border py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Распечатать накладную
            </motion.button>

            {whatsappUrl && (
              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground py-3 rounded-lg font-medium text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Написать в WhatsApp
              </motion.button>
            )}
          </div>

          {/* Кнопка на главную */}
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted py-3 px-6 rounded-lg font-medium text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              Вернуться на главную
            </motion.button>
          </Link>
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
