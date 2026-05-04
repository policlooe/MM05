import { ShoppingBag, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/hooks/use-catalog";
import { AddressLink } from "@/components/AddressLink";
import { CONTACTS } from "@/lib/contacts";

export function Navbar() {
  const { count, open } = useCart();
  const { open: openCatalog } = useCatalog();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<{ fullName?: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem("user");
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v.length > 100) return;
    navigate(v ? `/catalog?q=${encodeURIComponent(v)}` : "/catalog");
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all ${
        scrolled ? "bg-surface/70 shadow-lg" : "bg-surface/90"
      }`}
    >
      <div className="container-x flex items-center justify-between py-2 text-xs">
        <AddressLink variant="inline" className="text-muted-foreground flex-1 truncate" />
        <a href={`tel:${CONTACTS.phoneTel}`} className="hidden sm:block text-base">
          {CONTACTS.phone}
        </a>
      </div>

      <div className="container-x flex items-center gap-2 pb-3">
        <Link to="/" className="text-xl font-semibold">MM05</Link>

        <button
          onClick={openCatalog}
          className="hidden md:inline-flex px-4 py-2 bg-accent text-white rounded-lg"
        >
          Каталог
        </button>

        <form onSubmit={submit} className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти мебель..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
          />
        </form>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm truncate max-w-[120px]">
              {user.fullName || user.email}
            </span>
            <button onClick={handleLogout} className="text-xs">
              Выйти
            </button>
          </div>
        ) : (
          <Link to="/login" className="p-2 bg-accent rounded-lg">
            <User className="w-5 h-5 text-white" />
          </Link>
        )}

        <button
          onClick={open}
          className="relative p-2 border rounded-lg"
        >
          <ShoppingBag />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-accent text-white rounded-full px-1">
              {count}
            </span>
          )}
        </button>
      </div>
    </motion.header>
  );
}
