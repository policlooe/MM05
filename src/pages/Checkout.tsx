import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCart, formatPrice } from "@/store/cart";
import { orderService } from "@/services/order";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ecommerce } from "@/lib/web-vitals";

// Lazy load heavy components
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatLauncher = lazy(() => import("@/components/ChatLauncher").then(m => ({ default: m.ChatLauncher })));

// Схема валидации формы
const checkoutSchema = z.object({
  customerName: z.string().min(2, "Имя должно содержать минимум 2 символа").max(100),
  customerPhone: z.string().min(10, "Введите корректный номер телефона").max(20),
  customerEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  deliveryAddress: z.string().min(10, "Введите полный адрес доставки").max(500),
  customerNote: z.string().max(1000).optional().or(z.literal("")),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Один ключ идемпотентности на попытку оформления. Раньше ключ
  // генерировался заново на каждый сабмит, поэтому повтор после сетевой
  // ошибки создавал второй заказ и второй раз резервировал склад.
  const idempotencyKeyRef = useRef<string | null>(null);
  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `co-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    return idempotencyKeyRef.current;
  };
  
  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    customerNote: "",
  });

  // Прокрутка вверх при открытии страницы
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track begin checkout
    if (items.length > 0) {
      ecommerce.beginCheckout(
        items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.finalPrice,
          quantity: item.qty,
        })),
        total
      );
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (count === 0 && !loading) {
      toast.error("Корзина пуста");
      navigate("/");
    }
  }, [count, loading, navigate]);

  const handleChange = (field: keyof CheckoutForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error("Проверьте правильность заполнения формы");
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Ключ идемпотентности: стабилен для всех повторов этой попытки
      const idempotencyKey = getIdempotencyKey();

      // Подготовка данных заказа
      const orderData = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || null,
        deliveryAddress: form.deliveryAddress,
        customerNote: form.customerNote || null,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          price: item.basePrice,
          finalPrice: item.finalPrice, // КРИТИЧНО: используем finalPrice
          configuration: item.configuration,
          options: {
            assembly: item.assemblySelected,
            assemblyPrice: item.assemblyPrice,
          },
        })),
        totalPrice: total,
        idempotencyKey: idempotencyKey, // Добавляем idempotency key
      };

      // Создание заказа
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Провайдера обязательно передаём в redirectToCheckout: без него
        // allowlist принимал только Stripe, URL ЮKassa отвергался, и заказ
        // выглядел как «не создан», хотя он уже был создан и зарезервирован.
        try {
          const checkoutSession = await paymentService.createCheckoutSession(
            response.data.order.id
          );

          // sessionId ЮKassa = id платежа: он нужен странице успеха как
          // capability-параметр для гостевого поллинга статуса.
          if (checkoutSession?.data?.sessionId) {
            try {
              sessionStorage.setItem(
                `mm05_pid_${response.data.order.id}`,
                checkoutSession.data.sessionId
              );
            } catch {
              // приватный режим — поллинг отработает по cookies/логину
            }
          }

          await paymentService.redirectToCheckout(
            checkoutSession.data.url,
            checkoutSession.data.provider
          );
        } catch (redirectError) {
          console.error("Payment redirect error:", redirectError);
          toast.error(
            "Заказ создан, но перейти к оплате не удалось. Мы свяжемся с вами для подтверждения."
          );
          navigate("/checkout/success", {
            state: {
              order: response.data.order,
              whatsappUrl: response.data.whatsappUrl,
            },
          });
        }
      } else {
        // 200 с success:false раньше молча разблокировал кнопку: заказ не
        // создан, ошибки нет — тупик на последнем шаге покупки.
        toast.error(response.message || "Не удалось создать заказ");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      
      // Обработка ошибок недостатка товара
      if (error.response?.status === 409) {
        toast.error(error.response.data.error || "Недостаточно товара на складе");
      } else {
        toast.error(error.response?.data?.error || "Не удалось создать заказ");
      }
    } finally {
      setLoading(false);
    }
  };

  if (count === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="container-x py-6 pb-24 md:pb-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumbs />
          <h1 className="font-serif text-3xl font-semibold mb-2">Оформление заказа</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Заполните форму, и мы свяжемся с вами для подтверждения заказа
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Форма */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ФИО */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                    ФИО <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={form.customerName}
                    onChange={handleChange("customerName")}
                    placeholder="Иванов Иван Иванович"
                    maxLength={100}
                    className={`w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 transition-all ${
                      errors.customerName
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border focus:ring-accent/20 focus:border-accent"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.customerName && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.customerName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Телефон */}
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium mb-2">
                    Телефон <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={handleChange("customerPhone")}
                    placeholder="+7 (999) 123-45-67"
                    maxLength={20}
                    className={`w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 transition-all ${
                      errors.customerPhone
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border focus:ring-accent/20 focus:border-accent"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.customerPhone && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.customerPhone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email (опционально) */}
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">
                    Email <span className="text-muted-foreground text-xs">(необязательно)</span>
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange("customerEmail")}
                    placeholder="example@mail.ru"
                    className={`w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 transition-all ${
                      errors.customerEmail
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border focus:ring-accent/20 focus:border-accent"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.customerEmail && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.customerEmail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Адрес доставки */}
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium mb-2">
                    Адрес доставки <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="deliveryAddress"
                    type="text"
                    value={form.deliveryAddress}
                    onChange={handleChange("deliveryAddress")}
                    placeholder="г. Махачкала, ул. Ленина, д. 10, кв. 5"
                    maxLength={500}
                    className={`w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 transition-all ${
                      errors.deliveryAddress
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border focus:ring-accent/20 focus:border-accent"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.deliveryAddress && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.deliveryAddress}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Комментарий */}
                <div>
                  <label htmlFor="customerNote" className="block text-sm font-medium mb-2">
                    Комментарий <span className="text-muted-foreground text-xs">(необязательно)</span>
                  </label>
                  <textarea
                    id="customerNote"
                    value={form.customerNote}
                    onChange={handleChange("customerNote")}
                    placeholder="Дополнительная информация о заказе..."
                    maxLength={1000}
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-y"
                  />
                </div>

                {/* Кнопка отправки */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground py-4 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Оформление заказа...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Оформить заказ
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-center text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
                </p>
              </form>
            </div>

            {/* Сводка заказа */}
            <div className="md:col-span-1">
              <div className="bg-surface border border-border rounded-xl p-5 sticky top-20">
                <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                  Ваш заказ
                </h2>
                
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${JSON.stringify(item.configuration)}`} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.qty} × {formatPrice(item.finalPrice)}
                        </p>
                        {item.assemblySelected && (
                          <p className="text-xs text-accent">+ Сборка</p>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(item.qty * item.finalPrice)}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Товары ({count}):</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg pt-2">
                    <span>Итого:</span>
                    <span className="text-accent">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
