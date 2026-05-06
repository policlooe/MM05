import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart, formatPrice } from '@/store/cart';
import { toast } from 'sonner';
import { Heart, ShoppingCart } from 'lucide-react';
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
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = useCallback(() => {
    add(product);
    toast.success("✓ Добавлено в корзину", { 
      description: product.name,
      duration: 2000
    });
  }, [product, add]);

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Удалено из избранного" : "Добавлено в избранное", {
      duration: 1500
    });
  }, [isFavorite]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.2),
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
      }}
      className="group bg-surface rounded-xl overflow-hidden border border-border hover:border-accent/40 hover:shadow-[var(--shadow-hover)] transition-all duration-300 flex flex-col relative"
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
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.badge && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-background/95 backdrop-blur-sm border border-border text-muted-foreground text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-sm"
              >
                {product.badge}
              </motion.span>
            )}
            {product.inStock && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="bg-accent/90 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                В наличии
              </motion.span>
            )}
          </div>

          {/* Favorite Button */}
          <motion.button
            onClick={toggleFavorite}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 w-9 h-9 bg-background/95 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent hover:border-accent hover:text-white transition-all duration-300 z-10"
          >
            <Heart 
              className={`w-4 h-4 transition-all ${isFavorite ? 'fill-current text-red-500' : ''}`} 
            />
          </motion.button>
        </div>
      </Link>
      
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="font-bold text-base md:text-lg">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>
        
        <Link to={`/product/${product.slug}`} className="block mb-3">
          <h3 className="text-sm md:text-base text-foreground leading-snug line-clamp-2 hover:text-accent transition-colors font-medium">
            {product.name}
          </h3>
        </Link>
        
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
          className="mt-auto w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-accent flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          В корзину
        </motion.button>
      </div>
    </motion.article>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id && 
         prevProps.index === nextProps.index;
});

OptimizedProductCard.displayName = 'OptimizedProductCard';
