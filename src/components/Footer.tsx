import { Phone, MessageCircle, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/25 text-foreground pb-24 md:pb-10">
      <div className="container-x pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="text-2xl font-semibold text-foreground block mb-3">
              MM05
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Качественная мебель из ЛДСП, МДФ и массива дерева. Работаем с проверенными поставщиками с 2021 года.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">Каталог</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/catalog" className="text-foreground/85 hover:text-accent transition-colors">
                  Все товары
                </Link>
              </li>
              <li>
                <Link
                  to={`/catalog?cat=${encodeURIComponent("Кровати")}`}
                  className="text-foreground/85 hover:text-accent transition-colors"
                >
                  Кровати
                </Link>
              </li>
              <li>
                <Link
                  to={`/catalog?cat=${encodeURIComponent("Шкафы")}`}
                  className="text-foreground/85 hover:text-accent transition-colors"
                >
                  Шкафы
                </Link>
              </li>
              <li>
                <Link
                  to={`/catalog?cat=${encodeURIComponent("Беседки")}`}
                  className="text-foreground/85 hover:text-accent transition-colors"
                >
                  Беседки
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-foreground/85 hover:text-accent transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-foreground/85 hover:text-accent transition-colors">
                  Оплата по СБП
                </Link>
              </li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">Связь с нами</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <AddressLink variant="inline" className="text-sm text-muted-foreground hover:text-accent" />
              </li>
              <li>
                <a
                  href={`tel:${CONTACTS.phoneTel}`}
                  className="inline-flex items-center gap-2.5 text-foreground/85 hover:text-accent transition-colors"
                >
                  <PremiumIconMark icon={Phone} size="sm" tone="accent" className="shrink-0" />
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-foreground/85 hover:text-accent transition-colors"
                >
                  <PremiumIconMark icon={MessageCircle} size="sm" tone="accent" className="shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-foreground/85 hover:text-accent transition-colors"
                >
                  <PremiumIconMark icon={Send} size="sm" tone="accent" className="shrink-0" />
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-foreground/85 hover:text-accent transition-colors"
                >
                  <PremiumIconMark icon={Users} size="sm" tone="accent" className="shrink-0" />
                  ВКонтакте
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-5 text-xs text-muted-foreground text-center md:text-left">
          © 2026 MM05. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
