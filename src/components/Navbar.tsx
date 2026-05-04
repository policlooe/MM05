import { ShoppingBag, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/hooks/use-catalog";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";

export function Navbar() {
  const { count, open } = useCart();
  const { open: openCatalog } = useCatalog();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем наличие пользователя в localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Добавляем эффект при скролле
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    navigate(v ? `/catalog?q=${encodeURIComponent(v)}` : "/catalog");
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-surface/70 border-border shadow-lg' 
          : 'bg-surface/90 border-border/50'
      }`}
      style={{ 
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      {/* Локация - полная ширина с защитой от overflow */}
      <div className="w-full" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <div className="container-x">
          <div className="flex items-center justify-between py-2 text-xs gap-2">
            <AddressLink variant="inline" className="text-muted-foreground truncate flex-1 min-w-0" />
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`tel:${CONTACTS.phoneTel}`}
                className="hidden sm:inline-block text-base text-foreground hover:text-accent transition-colors whitespace-nowrap"
              >
                {CONTACTS.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Лого + Каталог + поиск + действия */}
      <div className="w-full" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <div className="container-x">
          <div className="flex items-center gap-2 md:gap-3 pb-3">
            {/* Лого */}
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0"
            >
              MM05
            </Link>

            {/* Кнопка Каталог - открывает sidebar */}
            <motion.button
              onClick={openCatalog}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-medium text-sm transition-all shadow-sm shrink-0"
            >
              Каталог
            </motion.button>

            {/* Поиск - растягивается на всё доступное пространство */}
            <form 
              onSubmit={submit} 
              className="flex-1 min-w-0 relative" 
              role="search"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[1.15] text-muted-foreground/90 z-10" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Найти мебель..."
                maxLength={100}
                aria-label="Поиск по сайту"
                className="w-full bg-secondary border border-border/60 focus:border-accent/35 rounded-lg pl-11 pr-4 py-3 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/18 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
              />
            </form>

            {/* Иконки справа от поиска - всегда вместе */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Войти / Профиль */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-secondary/50 max-w-[200px]">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-accent transition-colors px-2 whitespace-nowrap"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Войти в аккаунт"
                  className="inline-flex items-center justify-center h-[42px] w-[42px] min-w-[42px] rounded-xl bg-accent hover:bg-accent-hover transition-colors shadow-sm"
                >
                  <User className="w-5 h-5 text-white" />
                </Link>
              )}

              {/* Корзина */}
              <motion.button
                type="button"
                onClick={open}
                aria-label="Открыть корзину"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="relative inline-flex items-center justify-center h-[42px] w-[42px] min-w-[42px] rounded-xl text-foreground hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
              >
                <PremiumIconMark icon={ShoppingBag} size="sm" tone={count > 0 ? "accent" : "neutral"} />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-semibold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center shadow-sm tabular-nums"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
