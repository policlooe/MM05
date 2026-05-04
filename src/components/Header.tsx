import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '@/store/cart';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenCatalog: () => void;
}

export function Header({ onOpenCart, onOpenCatalog }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { count } = useCart();
  const cartItemsCount = count;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? 'h-14 md:h-16 bg-surface/90 border-b border-border shadow-sm' 
          : 'h-16 md:h-24 bg-surface' 
      } backdrop-blur-md`}
    >
      <div className="container-x h-full">
        <div className="flex h-full items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-xl md:text-2xl font-black tracking-tighter transition-transform group-active:scale-95">
              MM<span className="text-accent">05</span>
            </span>
          </Link>

          {/* Search - Desktop only */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input 
              type="text" 
              placeholder="Поиск мебели..."
              className="w-full h-11 pl-11 pr-4 bg-muted/50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-accent/20 focus:ring-0 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            <button className="md:hidden p-2.5 text-foreground active:scale-90 transition-transform">
              <Search className="w-6 h-6" />
            </button>

            <Link to="/account" className="hidden sm:block p-2.5 hover:bg-muted rounded-full transition-colors">
              <User className="w-6 h-6" />
            </Link>

            <button 
              onClick={onOpenCart}
              className="p-2.5 hover:bg-muted rounded-full transition-colors relative active:scale-90"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenCatalog}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-foreground text-surface rounded-xl font-bold hover:bg-foreground/90 transition-all active:scale-95"
            >
              <Menu className="w-5 h-5" />
              Каталог
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
