import { Home, LayoutGrid, Phone, Info } from "lucide-react";
import { NavLink } from "react-router-dom";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg min-w-0 flex-1 min-h-[44px]",
      "transition duration-150 active:scale-95",
      isActive
        ? "text-accent"
        : "text-muted-foreground"
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border/60"
      style={{ 
        minHeight: '60px',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      aria-label="Нижняя навигация"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-1 h-full">
        <NavLink to="/" className={linkClass} end>
          {({ isActive }) => (
            <>
              <Home className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-medium">Главная</span>
            </>
          )}
        </NavLink>
        <NavLink to="/catalog" className={linkClass}>
          {({ isActive }) => (
            <>
              <LayoutGrid className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-medium">Каталог</span>
            </>
          )}
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          {({ isActive }) => (
            <>
              <Info className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-medium">О нас</span>
            </>
          )}
        </NavLink>
        <NavLink to="/contact" className={linkClass}>
          {({ isActive }) => (
            <>
              <Phone className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-medium">Контакты</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
