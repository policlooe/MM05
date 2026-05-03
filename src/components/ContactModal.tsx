import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-surface border border-border rounded-2xl shadow-2xl z-[90] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent/10 to-transparent px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">Связь с нами</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* WhatsApp */}
              <a
                href={CONTACTS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-start gap-4 p-4 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    Быстрый ответ в мессенджере
                  </p>
                </div>
              </a>

              {/* Телефон */}
              <a
                href={`tel:${CONTACTS.phone}`}
                onClick={onClose}
                className="flex items-start gap-4 p-4 bg-surface hover:bg-muted border border-border rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">Телефон</p>
                  <p className="text-sm text-accent font-medium">
                    {CONTACTS.phoneFormatted}
                  </p>
                </div>
              </a>

              {/* Адрес */}
              <div className="flex items-start gap-4 p-4 bg-surface border border-border rounded-xl">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">Адрес</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {CONTACTS.address}
                  </p>
                </div>
              </div>

              {/* Режим работы */}
              <div className="flex items-start gap-4 p-4 bg-surface border border-border rounded-xl">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">Режим работы</p>
                  <p className="text-sm text-muted-foreground">
                    {CONTACTS.workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Мы всегда рады помочь вам с выбором мебели
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
