import { ShoppingBag, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/hooks/use-catalog";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { count, open } = useCart();
  const { open: openCatalog } = useCatalog();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add dynamic padding to body based on header height
  useEffect(() => {
    const updateBodyPadding = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        document.body.style.paddingTop = `${headerHeight}px`;
      }
    };

    // Update on mount and when window resizes
    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateBodyPadding);
      document.body.style.paddingTop = '0';
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v.length > 100) return;
    navigate(v ? `/catalog?q=${encodeURIComponent(v)}` : "/catalog");
  };

  return (
    <header 
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl transition-all duration-500 border-b",
        scrolled ? 'bg-surface/70 border-border shadow-lg' : 'bg-surface/90 border-border/50'
      )}
    >
      {/* Локация */}
      <div className="w-full overflow-hidden">
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

      {/* Лого + Поиск + Действия */}
      <div className="w-full overflow-hidden">
        <div className="container-x">
          <div className="flex items-center gap-2 md:gap-3 pb-3">
            <Link to="/" className="text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0">
              MM05
            </Link>

            <motion.button
              onClick={openCatalog}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-medium text-sm transition-all shadow-sm shrink-0"
            >
              Каталог
            </motion.button>

            <form onSubmit={submit} className="flex-1 min-w-0 relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[1.15] text-muted-foreground/90 z-10" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Найти мебель..."
                maxLength={100}
                className="w-full bg-secondary border border-border/60 focus:border-accent/35 rounded-lg pl-11 pr-4 py-3 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/10 transition-all"
              />
            </form>

            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/50 max-w-[150px]">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-medium text-foreground truncate">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-muted-foreground hover:text-accent transition-colors px-2"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center h-[42px] w-[42px] rounded-xl bg-accent hover:bg-accent-hover transition-colors shadow-sm"
                >
                  <User className="w-5 h-5 text-white" />
                </Link>
              )}

              <motion.button
                type="button"
                onClick={open}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center justify-center h-[42px] w-[42px] rounded-xl text-foreground hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
              >
                <PremiumIconMark 
                  icon={ShoppingBag} 
                  size="sm" 
                  tone={count > 0 ? "accent" : "neutral"} 
                />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-semibold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
