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
            <Link to="/" className="text-2xl font-bold text-foreground block mb-3">
              MM05
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Качественная мебель из ЛДСП, МДФ и массива дерева. Работаем с проверенными поставщиками с 2021 года.
            </p>
          </div>

          <nav aria-label="Навигация по каталогу">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 tracking-wide uppercase">Каталог</h4>
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
          </nav>

          <address className="not-italic">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 tracking-wide uppercase">Связь с нами</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <AddressLink variant="inline" className="text-sm text-foreground/85 hover:text-accent" />
              </li>
              <li>
                <a
                  href={`tel:${CONTACTS.phoneTel}`}
                  className="inline-flex items-center gap-2 text-foreground/85 hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 stroke-2 text-accent" />
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/85 hover:text-accent transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 stroke-2 text-accent" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/85 hover:text-accent transition-colors"
                >
                  <Send className="w-4 h-4 shrink-0 stroke-2 text-accent" />
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href={CONTACTS.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/85 hover:text-accent transition-colors"
                >
                  <Users className="w-4 h-4 shrink-0 stroke-2 text-accent" />
                  ВКонтакте
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-border pt-5 text-xs text-muted-foreground text-center md:text-left">
          © 2026 MM05. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
