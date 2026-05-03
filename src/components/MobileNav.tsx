import { useState } from "react";
import { Home, LayoutGrid, MessageCircle, Info } from "lucide-react";
import { NavLink } from "react-router-dom";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { ContactModal } from "@/components/ContactModal";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-colors min-w-0 flex-1 max-w-[88px]",
      isActive ? "text-accent bg-muted/70" : "text-muted-foreground hover:text-foreground hover:bg-muted/45"
    );

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(15,35,25,0.06)]"
        aria-label="Нижняя навигация"
      >
        <div className="grid grid-cols-4 gap-1 px-2 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <NavLink to="/" className={linkClass} end>
            {({ isActive }) => (
              <>
                <PremiumIconMark icon={Home} size="sm" tone={isActive ? "accent" : "neutral"} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>Главная</span>
              </>
            )}
          </NavLink>
          <NavLink to="/catalog" className={linkClass}>
            {({ isActive }) => (
              <>
                <PremiumIconMark icon={LayoutGrid} size="sm" tone={isActive ? "accent" : "neutral"} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>Каталог</span>
              </>
            )}
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            {({ isActive }) => (
              <>
                <PremiumIconMark icon={Info} size="sm" tone={isActive ? "accent" : "neutral"} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>О нас</span>
              </>
            )}
          </NavLink>
          <button
            onClick={() => setContactModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl min-w-0 flex-1 max-w-[88px] transition-colors text-muted-foreground hover:text-accent hover:bg-muted/45"
            aria-label="Связь"
          >
            <PremiumIconMark icon={MessageCircle} size="sm" tone="neutral" />
            <span className="text-xs font-medium">Связь</span>
          </button>
        </div>
      </nav>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
}
