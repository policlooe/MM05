import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, MessageCircle, Send, Users, Clock, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { CONTACTS } from "@/lib/contacts";

const WAREHOUSE_COORDS = { lat: 43.055698, lng: 47.32995 };
const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}&zoom=16`;
const googleMapsUrl = `https://www.google.com/maps?q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}`;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Имя должно быть от 2 символов" })
    .max(80, { message: "Имя слишком длинное" })
    .regex(/^[\p{L}\s'-]+$/u, { message: "Допустимы только буквы" }),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Введите корректный телефон" })
    .max(20, { message: "Телефон слишком длинный" })
    .regex(/^[+()0-9\s-]+$/, { message: "Некорректный формат телефона" }),
  message: z
    .string()
    .trim()
    .max(500, { message: "Сообщение слишком длинное" })
    .optional()
    .or(z.literal("")),
});

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast.error("Проверьте поля формы");
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForm({ name: "", phone: "", message: "" });
      toast.success("Заявка отправлена", { description: "Мы свяжемся с вами в ближайшее время." });
    }, 700);
  };

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-24 md:pb-10">
        <section className="container-x pt-8 md:pt-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-balance">Контакты</h1>
          <p className="text-muted-foreground max-w-2xl text-pretty">
            Свяжитесь с нами любым удобным способом — ответим в рабочее время.
          </p>
        </section>

        <section className="container-x py-8">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Левая колонка: карта + адрес + телефон/график */}
            <div className="flex flex-col gap-5">
              <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm h-[320px] md:h-[400px]">
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

              <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Адрес склада
                    </p>
                    <p className="text-sm font-medium leading-tight mb-2">{CONTACTS.address}</p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      Открыть в Google Maps →
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`tel:${CONTACTS.phoneTel}`}
                    className="flex items-center gap-3 group"
                  >
                    <PremiumIconMark icon={Phone} size="sm" tone="accent" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Позвонить</p>
                      <p className="text-sm font-semibold group-hover:text-accent transition-colors truncate">
                        {CONTACTS.phone}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <PremiumIconMark icon={Clock} size="sm" tone="neutral" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Режим работы</p>
                      <p className="text-sm font-semibold truncate">{CONTACTS.schedule}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка: мессенджеры (только на md+) + форма */}
            <div className="flex flex-col gap-5">
              {/* Мессенджеры — скрыты на мобильной версии по требованию */}
              <div className="hidden md:block bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-1">Мессенджеры</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Ответим в рабочее время, обычно до 10 минут
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  <a
                    href={CONTACTS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <PremiumIconMark icon={MessageCircle} size="md" tone="accent" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-accent transition-colors">
                        WhatsApp
                      </p>
                      <p className="text-xs text-muted-foreground truncate">Написать в WhatsApp</p>
                    </div>
                  </a>
                  <a
                    href={CONTACTS.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <PremiumIconMark icon={Send} size="md" tone="accent" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-accent transition-colors">
                        Telegram
                      </p>
                      <p className="text-xs text-muted-foreground truncate">Канал и чат</p>
                    </div>
                  </a>
                  <a
                    href={CONTACTS.vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <PremiumIconMark icon={Users} size="md" tone="accent" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-accent transition-colors">
                        ВКонтакте
                      </p>
                      <p className="text-xs text-muted-foreground truncate">Официальная страница MM05</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Форма обратного звонка */}
              <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex-1">
                <h2 className="font-serif text-xl font-semibold mb-1">Заказать звонок</h2>
                <p className="text-sm text-muted-foreground mb-4">Перезвоним и проконсультируем</p>
                <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
                  <div>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={set("name")}
                      maxLength={80}
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/60 focus:border-accent/40 outline-none text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Телефон"
                      value={form.phone}
                      onChange={set("phone")}
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/60 focus:border-accent/40 outline-none text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Комментарий (необязательно)"
                      value={form.message}
                      onChange={set("message")}
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border/60 focus:border-accent/40 outline-none text-sm resize-y min-h-[90px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive mt-1">{errors.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent hover:bg-accent-hover text-accent-foreground py-3.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.45)]"
                  >
                    {loading ? "Отправка..." : "Жду звонка"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};

export default ContactPage;
