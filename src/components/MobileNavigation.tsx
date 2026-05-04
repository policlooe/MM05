import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '@/store/cart';

export function MobileNavigation({ onOpenCatalog, onOpenCart }: { onOpenCatalog: () => void, onOpenCart: () => void }) {
  const location = useLocation();
  const { count } = useCart();
  const cartCount = count;

  const navItems = [
    { label: 'Главная', icon: Home, path: '/', action: null },
    { label: 'Каталог', icon: LayoutGrid, path: null, action: onOpenCatalog },
    { label: 'Корзина', icon: ShoppingBag, path: null, action: onOpenCart, badge: cartCount },
    { label: 'Избранное', icon: Heart, path: '/favorites', action: null },
    { label: 'Профиль', icon: User, path: '/account', action: null },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-border px-2 pb-safe-area">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          const content = (
            <div className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'fill-accent/10' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          );

          return item.path ? (
            <Link key={idx} to={item.path} className="flex-1 py-2">{content}</Link>
          ) : (
            <button key={idx} onClick={item.action} className="flex-1 py-2">{content}</button>
          );
        })}
      </div>
    </nav>
  );
}
