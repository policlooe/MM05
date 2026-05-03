import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/store/cart";
import { PremiumIconMark } from "@/components/PremiumIcon";

export function CartSidebar() {
  const { items, total, count, isOpen, close, setQty, remove } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Вычисляем ширину скроллбара
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Устанавливаем CSS переменную для ширины скроллбара
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      // Блокируем прокрутку
      document.body.classList.add('overflow-hidden');
    } else {
      // Восстанавливаем прокрутку
      document.body.classList.remove('overflow-hidden');
      document.documentElement.style.removeProperty('--scrollbar-width');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.style.removeProperty('--scrollbar-width');
    };
  }, [isOpen]);

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface z-[70] shadow-lg flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Корзина"
      >
        <header className="flex items-center justify-between px-7 py-6 border-b border-border bg-gradient-to-r from-muted/25 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <PremiumIconMark icon={ShoppingBag} size="sm" tone="accent" className="shrink-0" />
            <h3 className="font-serif text-2xl font-semibold truncate">Ваш заказ</h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-5 h-5 stroke-[1.15]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {items.length === 0 ? (
                <div className="flex flex-col items-center text-center py-16 px-4">
                  <PremiumIconMark icon={ShoppingBag} size="lg" tone="neutral" className="mb-5 opacity-95" />
                  <p className="text-sm text-muted-foreground font-medium">Корзина пуста</p>
                  <p className="text-xs text-muted-foreground/90 mt-2 max-w-[240px] leading-relaxed">
                    Добавьте товары из каталога — они появятся здесь.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col">
                  {items.map((i) => (
                    <li key={`${i.id}-${JSON.stringify(i.configuration)}`} className="flex gap-4 py-4 border-b border-border animate-fade-in">
                      <div className="w-[72px] h-[72px] rounded bg-background overflow-hidden shrink-0">
                        <img src={i.image} alt={i.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1 truncate">{i.name}</p>
                        
                        {/* Отображение конфигурации */}
                        {i.configuration && (
                          <div className="text-[10px] text-muted-foreground mb-1 space-y-0.5">
                            {Object.entries(i.configuration.variants).map(([key, value]) => 
                              value && (
                                <div key={key} className="truncate">
                                  {key}: {value}
                                </div>
                              )
                            )}
                            {i.assemblySelected && (
                              <div className="text-accent font-medium">
                                ✓ Сборка: +{formatPrice(i.assemblyPrice || 0)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Цена - всегда используем finalPrice */}
                        <div className="space-y-0.5">
                          {i.finalPrice !== i.basePrice && (
                            <p className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(i.basePrice)}
                            </p>
                          )}
                          <p className="text-accent font-semibold text-sm">
                            {formatPrice(i.finalPrice)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2.5 mt-2">
                          <button
                            onClick={() => setQty(i.id, i.qty - 1)}
                            className="w-6 h-6 border border-border rounded hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center"
                            aria-label="Уменьшить"
                          >
                            <Minus className="w-3 h-3 stroke-[1.35]" />
                          </button>
                          <span className="text-sm font-medium min-w-[20px] text-center">{i.qty}</span>
                          <button
                            onClick={() => setQty(i.id, i.qty + 1)}
                            className="w-6 h-6 border border-border rounded hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center"
                            aria-label="Увеличить"
                          >
                            <Plus className="w-3 h-3 stroke-[1.35]" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => remove(i.id)}
                        className="text-muted-foreground hover:text-accent transition-colors self-start p-1"
                        aria-label="Удалить"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.15]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="px-7 py-6 border-t border-border">
                <div className="flex justify-between items-center font-semibold mb-5">
                  <span>Итого</span>
                  <span className="text-accent text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Товаров: {count}. Оформите заказ, и мы свяжемся с вами для подтверждения.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-accent text-primary-foreground py-4 label-nav transition-colors"
                >
                  Оформить заказ
                </button>
              </footer>
            )}
          </aside>
        </>
      );
    }
