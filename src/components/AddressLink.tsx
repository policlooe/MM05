import { MapPin } from "lucide-react";
import { buildMapsUrl, CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

type Props = {
  variant?: "card" | "inline";
  className?: string;
};

/**
 * Кнопка-ссылка на адрес склада. По клику открывает нативное приложение карт.
 * buildMapsUrl() формирует href в момент клика — корректно для iOS/Android/desktop.
 */
export function AddressLink({ variant = "inline", className = "" }: Props) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = buildMapsUrl();
    if (url.startsWith("maps:") || url.startsWith("geo:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (variant === "card") {
    return (
      <a
        href="#"
        onClick={onClick}
        className={`flex items-start gap-3 group cursor-pointer ${className}`}
        aria-label="Открыть адрес склада в картах"
      >
        <PremiumIconMark icon={MapPin} size="md" tone="accent" className="shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground">Склад / шоурум — открыть в картах</p>
          <p className="font-semibold leading-snug group-hover:text-accent transition-colors">
            Дагестан, г. Махачкала,
            <br />
            п. Шамхал, ул. Сулеймана Стальского, 1
          </p>
        </div>
      </a>
    );
  }

  return (
    <a
      href="#"
      onClick={onClick}
      className={`inline-flex items-center gap-2 hover:text-accent transition-colors text-sm font-medium ${className}`}
      aria-label="Открыть адрес склада в картах"
    >
      <MapPin className="w-4 h-4 shrink-0 stroke-2 text-muted-foreground" />
      <span>{CONTACTS.addressShort}, Махачкала</span>
    </a>
  );
}
