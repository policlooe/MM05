import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';
import { useCart, formatPrice } from '@/store/cart';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export function CartSidebar() {
  const { items, total, setQty, remove, isOpen, close } = useCart();
  const navigate = useNavigate();
  useScrollLock(isOpen);
  const focusTrapRef = useFocusTrap(isOpen);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
            aria-hidden="true"
          />
          <motion.div
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Корзина покупок"
            aria-live="polite"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 stroke-[1.5] text-accent" aria-hidden="true" />
                <h2 className="text-xl font-bold">Корзина</h2>
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button 
                onClick={close} 
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Закрыть корзину"
              >
                <X className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground">Ваша корзина пуста</p>
                </div>
              ) : (
                items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-3 bg-card rounded-xl border border-border"
                    role="article"
                    aria-label={`${item.name}, количество ${item.qty}, цена ${formatPrice(item.finalPrice)}`}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg" 
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-accent font-bold mt-1">{formatPrice(item.finalPrice)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-background" role="group" aria-label="Управление количеством">
                          <button 
                            className="px-2 py-1 hover:bg-muted" 
                            onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                            aria-label={`Уменьшить количество ${item.name}`}
                          >-</button>
                          <span className="px-2 text-xs font-bold" aria-label={`Количество: ${item.qty}`}>{item.qty}</span>
                          <button 
                            className="px-2 py-1 hover:bg-muted" 
                            onClick={() => setQty(item.id, item.qty + 1)}
                            aria-label={`Увеличить количество ${item.name}`}
                          >+</button>
                        </div>
                        <button 
                          onClick={() => remove(item.id)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                          aria-label={`Удалить ${item.name} из корзины`}
                        >
                          <Trash2 className="w-4 h-4 stroke-2" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-surface">
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(total)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  aria-label="Перейти к оформлению заказа"
                >
                  Оформить заказ
                  <ChevronRight className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
