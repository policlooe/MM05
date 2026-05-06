import { Home, LayoutGrid, Phone, Info } from "lucide-react";
import { NavLink } from "react-router-dom";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl min-w-0 flex-1 max-w-[88px]",
      "transition-all duration-200 active:scale-95 hover:text-accent",
      isActive
        ? "text-accent bg-muted/70"
        : "text-muted-foreground hover:bg-muted/45"
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(15,35,25,0.06)] h-14"
      aria-label="Нижняя навигация"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-1.5 h-full">
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
        <NavLink to="/contact" className={linkClass}>
          {({ isActive }) => (
            <>
              <PremiumIconMark icon={Phone} size="sm" tone={isActive ? "accent" : "neutral"} />
              <span className={cn("text-xs font-medium", isActive && "font-semibold")}>Контакты</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
