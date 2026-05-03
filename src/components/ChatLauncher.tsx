import { useState } from "react";
import { MessageCircle, Send, X, MessagesSquare, Users, Phone } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className="mb-3 bg-surface border border-border rounded-xl shadow-[0_16px_48px_-12px_rgba(15,35,25,0.15)] p-4 w-[17rem] animate-fade-in-up ring-1 ring-border/60"
          role="dialog"
          aria-label="Связаться с нами"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm tracking-tight">Связь с нами</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 stroke-[1.15]" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Выберите удобный мессенджер — ответим в рабочее время, обычно до 10 минут.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
            >
              <PremiumIconMark icon={MessageCircle} size="sm" tone="accent" className="shrink-0" />
              WhatsApp
            </a>
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
            >
              <PremiumIconMark icon={Send} size="sm" tone="accent" className="shrink-0" />
              Telegram
            </a>
            <a
              href={CONTACTS.vk}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
            >
              <PremiumIconMark icon={Users} size="sm" tone="accent" className="shrink-0" />
              ВКонтакте
            </a>
            <a
              href={`tel:${CONTACTS.phoneTel}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
            >
              <PremiumIconMark icon={Phone} size="sm" tone="accent" className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Позвонить</span>
                <span className="font-medium">{CONTACTS.phone}</span>
              </div>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
        className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-accent-foreground shadow-[0_10px_28px_-6px_hsl(var(--accent)/0.55)] flex items-center justify-center transition-colors ring-2 ring-background"
      >
        {open ? <X className="w-5 h-5 stroke-[1.15]" /> : <MessagesSquare className="w-5 h-5 stroke-[1.15]" />}
      </button>
    </div>
  );
}
