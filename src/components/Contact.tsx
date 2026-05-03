import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, MessageCircle, Send, Clock, Users } from "lucide-react";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

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

export function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <section id="contact" className="container-x py-10">
      <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-5">Контакты</h2>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Контакты */}
        <div className="bg-surface border border-border rounded-xl p-5 md:p-7 space-y-5 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
          <a href={`tel:${CONTACTS.phoneTel}`} className="flex items-center gap-3 group">
            <PremiumIconMark icon={Phone} size="md" tone="accent" className="shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Телефон</p>
              <p className="font-semibold group-hover:text-accent transition-colors">{CONTACTS.phone}</p>
            </div>
          </a>

          <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <PremiumIconMark icon={MessageCircle} size="md" tone="accent" className="shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="font-semibold group-hover:text-accent transition-colors">Написать в WhatsApp</p>
            </div>
          </a>

          <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <PremiumIconMark icon={Send} size="md" tone="accent" className="shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Telegram</p>
              <p className="font-semibold group-hover:text-accent transition-colors">Канал и чат</p>
            </div>
          </a>

          <a href={CONTACTS.vk} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <PremiumIconMark icon={Users} size="md" tone="accent" className="shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">ВКонтакте</p>
              <p className="font-semibold group-hover:text-accent transition-colors">Официальная страница MM05</p>
            </div>
          </a>

          <div className="pt-2 border-t border-border">
            <AddressLink variant="card" />
          </div>

          <div className="flex items-center gap-3">
            <PremiumIconMark icon={Clock} size="md" tone="neutral" className="shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Режим работы</p>
              <p className="font-semibold">{CONTACTS.schedule}</p>
            </div>
          </div>
        </div>

        {/* Форма */}
        <div className="bg-surface border border-border rounded-xl p-5 md:p-7 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
          <h3 className="font-serif text-xl font-semibold mb-1">Заказать звонок</h3>
          <p className="text-sm text-muted-foreground mb-5">Перезвоним и проконсультируем</p>
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
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
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
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
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
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
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
    </section>
  );
}
