import { MapPin, Phone, MessageCircle, Send, Clock, Users, Package, Wrench } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

// Координаты склада для Google Maps
const WAREHOUSE_COORDS = { lat: 43.055698, lng: 47.329950 };
const WAREHOUSE_ADDRESS = "Дагестан, г. Махачкала, п. Шамхал, ул. Сулеймана Стальского, 1";

export function ContactUs() {
  // Google Maps embed URL
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}&zoom=16`;
  
  // Google Maps link URL
  const googleMapsUrl = `https://www.google.com/maps?q=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}`;

  return (
    <section id="contact-us" className="py-8 md:py-12">
      <div className="container-x">
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">Как нас найти?</h2>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Левая колонка - Контакты и местоположение */}
          <div className="flex flex-col gap-6">
            {/* Местоположение и контакты */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-md flex-1">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Магазин / точка отправки
                  </p>
                  <p className="text-sm font-semibold leading-snug mb-2">
                    {CONTACTS.address}
                  </p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline inline-block font-semibold"
                  >
                    Открыть в Google Maps →
                  </a>
                </div>
              </div>

              {/* Контакты компании */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <PremiumIconMark icon={Clock} size="sm" tone="neutral" className="shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Время работы</p>
                    <p className="text-sm font-semibold">{CONTACTS.schedule}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PremiumIconMark icon={Phone} size="sm" tone="accent" className="shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Позвонить</p>
                    <a 
                      href={`tel:${CONTACTS.phoneTel}`}
                      className="text-sm font-semibold hover:text-accent transition-colors"
                    >
                      {CONTACTS.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-md h-[300px] lg:h-[350px]">
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

          {/* Правая колонка */}
          <div className="flex flex-col gap-6">
            {/* О компании с доставкой и сборкой */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-md flex-1">
              <h3 className="text-lg font-bold mb-3">Качественная мебель</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Работаем напрямую с поставщиками. Предлагаем мебель из ЛДСП, МДФ и эксклюзивные кровати из массива бука по справедливым ценам.
              </p>
              
              {/* Доставка и сборка */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">Доставка</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Стоимость доставки обсуждается с менеджером индивидуально в зависимости от адреса и объёма заказа.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">Сборка мебели</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Сборка возможна при наличии свободного мастера, уточняется при оформлении заказа.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Мессенджеры - единый блок */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-md flex-1">
              <h3 className="text-lg font-bold mb-1">Выберите удобный мессенджер</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Ответим в рабочее время, обычно до 10 минут
              </p>

              <div className="space-y-3">
                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-accent/5 hover:shadow-md transition-all group"
                >
                  <PremiumIconMark icon={MessageCircle} size="sm" tone="accent" className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm group-hover:text-accent transition-colors">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Написать в WhatsApp</p>
                  </div>
                </a>

                <a
                  href={CONTACTS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-accent/5 hover:shadow-md transition-all group"
                >
                  <PremiumIconMark icon={Send} size="sm" tone="accent" className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm group-hover:text-accent transition-colors">Telegram</p>
                    <p className="text-xs text-muted-foreground">Канал и чат</p>
                  </div>
                </a>

                <a
                  href={CONTACTS.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-accent/5 hover:shadow-md transition-all group"
                >
                  <PremiumIconMark icon={Users} size="sm" tone="accent" className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm group-hover:text-accent transition-colors">ВКонтакте</p>
                    <p className="text-xs text-muted-foreground">Официальная страница MM05</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
