import { ShoppingBag, Search, User, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useCatalog } from "@/hooks/use-catalog";
import { api } from "@/services/api";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { cn } from "@/lib/utils";

export const Navbar = memo(function Navbar() {
  const { count, open } = useCart();
  const { favorites } = useFavorites();
  const { open: openCatalog } = useCatalog();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  // КРИТИЧНО: Scroll handler с requestAnimationFrame throttle
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // КРИТИЧНО: ResizeObserver вместо resize event - ловит изменения контента
  useEffect(() => {
    const updateBodyPadding = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        document.body.style.paddingTop = `${headerHeight}px`;
      }
    };

    updateBodyPadding();

    // ResizeObserver для отслеживания изменений высоты header
    const resizeObserver = new ResizeObserver(updateBodyPadding);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      document.body.style.paddingTop = '0';
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Вызываем API для очистки cookies на backend (через axios-клиент с CSRF-заголовком)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем данные пользователя из localStorage
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v.length > 100) return;
    if (v) {
      navigate(`/catalog?search=${encodeURIComponent(v)}`);
    } else {
      navigate("/catalog");
    }
  };

  return (
    <header 
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 border-b bg-surface",
        scrolled ? 'border-border shadow-sm' : 'border-border/50'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Локация - скрыта на мобильных */}
      <div className="w-full overflow-hidden hidden md:block">
        <div className="container-x">
          <div className="flex items-center justify-between py-2 gap-2">
            <AddressLink variant="inline" className="text-foreground truncate flex-1 min-w-0" />
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`tel:${CONTACTS.phoneTel}`}
                className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap"
              >
                {CONTACTS.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Лого + Поиск + Действия */}
      <div className="w-full overflow-hidden">
        <div className="container-x">
          <nav className="flex items-center gap-2 md:gap-3 py-2 md:pb-3" aria-label="Основная навигация">
            <Link to="/" className="text-xl md:text-2xl font-semibold whitespace-nowrap shrink-0">
              MM05
            </Link>

            <motion.button
              onClick={openCatalog}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-medium text-sm transition shadow-sm shrink-0"
            >
              Каталог
            </motion.button>

            <form onSubmit={submit} className="flex-1 min-w-0 relative" role="search">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 stroke-2 text-muted-foreground/90 z-10" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Найти мебель..."
                maxLength={100}
                aria-label="Поиск товаров"
                className="w-full bg-secondary border border-border/60 focus:!border-border rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:!ring-0 focus:!shadow-none transition h-9"
              />
            </form>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                to="/favorites"
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-foreground hover:bg-muted/80 transition-colors"
                aria-label={`Избранное${favorites.length > 0 ? ` (${favorites.length})` : ''}`}
              >
                <Heart className={`w-5 h-5 stroke-[1.5] ${favorites.length > 0 ? 'fill-current text-red-500' : ''}`} aria-hidden="true" />
                {favorites.length > 0 && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </Link>

              <motion.button
                type="button"
                onClick={open}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-foreground hover:bg-muted/80 transition-colors"
                aria-label={`Корзина${count > 0 ? ` (${count})` : ''}`}
              >
                <ShoppingBag className={`w-5 h-5 stroke-[1.5] ${count > 0 ? 'text-accent' : 'text-foreground'}`} aria-hidden="true" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-semibold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>

              {user ? (
                <div className="flex items-center gap-1">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/50 max-w-[150px]">
                    <User className="w-5 h-5 stroke-[1.5] text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-accent transition-colors px-2"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-accent hover:bg-accent-hover transition-colors"
                  aria-label="Войти"
                >
                  <User className="w-5 h-5 stroke-[1.5] text-white" aria-hidden="true" />
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
});
