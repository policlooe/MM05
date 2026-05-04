import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { Product, ProductVariant, ProductOption } from '@/types/product';
import { useCart } from '@/store/cart';
import type { Product as StoreProduct } from '@/data/products';

export function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption>>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { add } = useCart();

  const totalPrice = product.basePrice + Object.values(selectedOptions).reduce((acc, opt) => acc + opt.price, 0);

  const handleAddToCart = () => {
    // Адаптируем под существующий API корзины
    const storeProduct: StoreProduct = {
      id: `${product.id}-${selectedVariant.colorId}`,
      slug: product.id,
      name: `${product.name} (${selectedVariant.colorName})`,
      category: 'Кровати' as any, // Временно
      price: product.basePrice,
      image: selectedVariant.image,
      shortDescription: '',
      description: '',
      specs: [],
      leadTime: '',
      inStock: true,
    };
    
    add(storeProduct, undefined, totalPrice);
  };

  return (
    <div className="group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Изображение с быстрой сменой цвета */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedVariant.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={selectedVariant.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </AnimatePresence>
        
        {/* Мобильная кнопка конфигуратора */}
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="md:hidden absolute bottom-3 right-3 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg"
        >
          <ShoppingCart className="w-5 h-5 text-accent" />
        </button>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-black text-accent">{totalPrice.toLocaleString()} ₽</span>
          {product.basePrice < totalPrice && <span className="text-xs text-muted-foreground line-through">{product.basePrice.toLocaleString()} ₽</span>}
        </div>

        {/* Выбор цвета - доступен всегда */}
        <div className="flex flex-wrap gap-2 mb-5">
          {product.variants.map((v) => (
            <button
              key={v.colorId}
              onClick={() => setSelectedVariant(v)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedVariant.colorId === v.colorId ? 'border-accent scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: v.colorCode }}
              title={v.colorName}
            />
          ))}
        </div>

        {/* Десктопные доп. опции */}
        <div className="hidden md:block space-y-4 mb-6">
          {product.additionalOptions?.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{group.title}</p>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [group.title]: opt }))}
                    className={`text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                      selectedOptions[group.title]?.id === opt.id 
                        ? 'border-accent bg-accent/5 font-bold' 
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {opt.name} (+{opt.price} ₽)
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddToCart}
          className="w-full bg-foreground text-surface py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all active:scale-[0.98]"
        >
          Добавить в корзину
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Мобильный конфигуратор (Bottom Sheet) */}
      <AnimatePresence>
        {isConfigOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[32px] z-[101] p-6 pb-safe-area md:hidden shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-6">Настройте ваш {product.name}</h2>
              
              <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                {product.additionalOptions?.map((group) => (
                  <div key={group.title}>
                    <p className="text-sm font-bold mb-3">{group.title}</p>
                    <div className="flex flex-col gap-2">
                      {group.items.map((opt) => (
                        <label key={opt.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-border active:bg-muted">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={group.title} 
                              checked={selectedOptions[group.title]?.id === opt.id}
                              onChange={() => setSelectedOptions(prev => ({ ...prev, [group.title]: opt }))}
                              className="w-5 h-5 accent-accent"
                            />
                            <span className="text-sm font-medium">{opt.name}</span>
                          </div>
                          <span className="text-sm font-bold text-accent">+{opt.price} ₽</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => { handleAddToCart(); setIsConfigOpen(false); }}
                className="w-full bg-accent text-white py-4 rounded-2xl font-bold mt-6 shadow-lg shadow-accent/20"
              >
                Подтвердить — {totalPrice.toLocaleString()} ₽
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
