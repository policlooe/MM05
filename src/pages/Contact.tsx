import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { MapPin, Phone, MessageCircle, Send, Users, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Координаты склада для Google Maps
const WAREHOUSE_COORDS = { lat: 43.055698, lng: 47.329950 };

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}&zoom=16`;
  const googleMapsUrl = `https://www.google.com/maps?q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Заполните все поля");
      return;
    }

    setLoading(true);
    
    // Формируем сообщение для WhatsApp
    const whatsappMessage = `Новое сообщение с сайта:\n\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nСообщение: ${formData.message}`;
    const whatsappUrl = `${CONTACTS.whatsapp}&text=${encodeURIComponent(whatsappMessage)}`;
    
    // Открываем WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Очищаем форму
    setFormData({ name: "", phone: "", message: "" });
    setLoading(false);
    toast.success("Сообщение отправлено в WhatsApp");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-24 md:pb-10">
        <div className="container-x pt-6">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Контакты</h1>
          <p className="text-muted-foreground max-w-2xl mb-8">
            Свяжитесь с нами любым удобным способом — ответим в рабочее время
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Левая колонка - Контактная информация */}
            <div className="flex flex-col gap-6">
              {/* Контактная информация */}
              <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4">Контактная информация</h2>
                
                <div className="space-y-4">
                  {/* Адрес - ПЕРВЫМ */}
                  <div className="flex items-start gap-3">
                    <PremiumIconMark icon={MapPin} size="sm" tone="neutral" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Склад / шоурум</p>
                      <p className="text-sm font-medium leading-tight mb-2">
                        {CONTACTS.address}
                      </p>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                      >
                        Открыть в картах →
                      </a>
                    </div>
                  </div>

                  {/* Режим работы */}
                  <div className="flex items-start gap-3">
                    <PremiumIconMark icon={Clock} size="sm" tone="neutral" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Режим работы</p>
                      <p className="text-sm font-semibold">{CONTACTS.schedule}</p>
                    </div>
                  </div>

                  {/* Телефон */}
                  <div className="flex items-start gap-3 pt-3 border-t border-border">
                    <PremiumIconMark icon={Phone} size="sm" tone="accent" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                      <a 
                        href={`tel:${CONTACTS.phoneTel}`}
                        className="text-sm font-semibold hover:text-accent transition-colors"
                      >
                        {CONTACTS.phone}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-3">
                    <PremiumIconMark icon={MessageCircle} size="sm" tone="accent" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                      <a 
                        href={CONTACTS.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold hover:text-accent transition-colors"
                      >
                        Написать в WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className="flex items-start gap-3">
                    <PremiumIconMark icon={Send} size="sm" tone="accent" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Telegram</p>
                      <a 
                        href={CONTACTS.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold hover:text-accent transition-colors"
                      >
                        Канал и чат
                      </a>
                    </div>
                  </div>

                  {/* ВКонтакте */}
                  <div className="flex items-start gap-3">
                    <PremiumIconMark icon={Users} size="sm" tone="accent" className="shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">ВКонтакте</p>
                      <a 
                        href={CONTACTS.vk}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold hover:text-accent transition-colors"
                      >
                        Официальная страница MM05
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm h-[400px]">
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Местоположение склада MM05"
                />
              </div>
            </div>

            {/* Правая колонка - Форма обратной связи */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm h-fit">
              <h2 className="font-serif text-xl font-semibold mb-2">Напишите нам</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Заполните форму, и мы свяжемся с вами в ближайшее время
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Имя */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Ваше имя <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Иван Иванов"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    required
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Телефон <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    maxLength={20}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    required
                  />
                </div>

                {/* Сообщение */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Сообщение <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Расскажите, чем мы можем помочь..."
                    maxLength={1000}
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-y"
                    required
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
                      Отправка...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Отправить сообщение
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-center text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};

export default ContactPage;
