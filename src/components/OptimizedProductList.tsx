import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart, formatPrice } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import { toast } from 'sonner';
import { Heart, ShoppingCart } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
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
  const { add: addToFavorites, remove: removeFromFavorites, isFavorite } = useFavorites();
  const isInFavorites = isFavorite(product.id);

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
    
    if (isInFavorites) {
      removeFromFavorites(product.id);
      toast.success("Удалено из избранного", {
        description: product.name,
        duration: 1500
      });
    } else {
      addToFavorites(product);
      toast.success("Добавлено в избранное", {
        description: product.name,
        duration: 1500
      });
    }
  }, [isInFavorites, product, addToFavorites, removeFromFavorites]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.2, 
        delay: Math.min(index * 0.03, 0.15),
        ease: [0.22, 1, 0.36, 1]
      }}
      role="article"
      aria-label={`Товар: ${product.name}, цена ${formatPrice(product.price)}`}
      className="ios-gpu-optimized group bg-surface rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-150 flex flex-col relative"
      style={{
        transform: 'translateZ(0)',
        willChange: 'auto',
        contain: 'layout style paint'
      }}
    >
      <Link 
        to={`/product/${product.slug}`} 
        className="block"
        aria-label={`Перейти к товару ${product.name}`}
      >
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.badge && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-background/95 backdrop-blur-sm border border-border text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-md shadow-sm"
              >
                {product.badge}
              </motion.span>
            )}
            {product.inStock && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="bg-accent/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1"
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
            className="absolute top-2 right-2 w-9 h-9 bg-background/95 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent hover:text-white transition-all duration-300 z-10"
            aria-label={isInFavorites 
              ? `Удалить ${product.name} из избранного` 
              : `Добавить ${product.name} в избранное`}
            aria-pressed={isInFavorites}
          >
            <Heart 
              className={`w-4 h-4 stroke-2 transition-all ${isInFavorites ? 'fill-current text-red-500' : ''}`}
              aria-hidden="true"
            />
          </motion.button>
        </div>
      </Link>
      
      <div className="p-2.5 flex flex-col flex-1">
        <div className="flex items-baseline gap-2 mb-1.5">
          <p className="font-semibold text-base">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>
        
        <Link to={`/product/${product.slug}`} className="block mb-2.5">
          <h3 className="text-sm text-foreground leading-[1.3] line-clamp-2 hover:text-accent transition-colors font-normal">
            {product.name}
          </h3>
        </Link>
        
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
          className="mt-auto w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
          aria-label={`Добавить ${product.name} в корзину за ${formatPrice(product.price)}`}
        >
          <ShoppingCart className="w-4 h-4 stroke-2" aria-hidden="true" />
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
