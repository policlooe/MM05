import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart, formatPrice } from '@/store/cart';
import { toast } from 'sonner';
import type { Product } from '@/data/products';

// Оптимизированная карточка товара с минимальными ререндерами
export const OptimizedProductCard = memo(({ 
  product, 
  index 
}: { 
  product: Product; 
  index: number;
}) => {
  const { add } = useCart();

  const handleAddToCart = useCallback(() => {
    add(product);
    toast.success("✓ Добавлено в корзину", { 
      description: product.name,
      duration: 2000
    });
  }, [product, add]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: Math.min(index * 0.08, 0.4), // Ограничиваем максимальную задержку
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group bg-surface rounded-xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-2xl transition-shadow flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.5, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm border border-border text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md"
            >
              {product.badge}
            </motion.span>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-semibold text-sm md:text-base mb-0.5">{formatPrice(product.price)}</p>
        {product.oldPrice && (
          <p className="text-[10px] md:text-xs text-muted-foreground line-through mb-1">
            {formatPrice(product.oldPrice)}
          </p>
        )}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-[11px] md:text-xs text-foreground/80 leading-tight mb-2 line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
          className="mt-auto w-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground text-[11px] md:text-xs font-medium py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          В корзину
        </motion.button>
      </div>
    </motion.article>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для memo
  return prevProps.product.id === nextProps.product.id && 
         prevProps.index === nextProps.index;
});

OptimizedProductCard.displayName = 'OptimizedProductCard';
