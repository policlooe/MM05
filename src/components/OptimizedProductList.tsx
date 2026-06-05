import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart, formatPrice } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import { toast } from 'sonner';
import { Heart, ShoppingBag } from 'lucide-react';
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
    <article
      role="article"
      aria-label={`Товар: ${product.name}, цена ${formatPrice(product.price)}`}
      className="ios-gpu-optimized group bg-surface rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-150 flex flex-col relative h-full"
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
              <span className="bg-background/95 border border-border text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                {product.badge}
              </span>
            )}
            {product.inStock && (
              <span className="bg-accent/90 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                В наличии
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 w-9 h-9 bg-background/95 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent hover:text-white transition-all duration-300 z-10"
            aria-label={isInFavorites 
              ? `Удалить ${product.name} из избранного` 
              : `Добавить ${product.name} в избранное`}
            aria-pressed={isInFavorites}
          >
            <Heart 
              className={`w-4 h-4 stroke-2 transition-all ${isInFavorites ? 'fill-current text-red-500' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </Link>
      
      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {/* Цены - фиксированная высота */}
        <div className="flex items-baseline gap-2 mb-1.5 min-h-[24px]">
          <p className="font-semibold text-base">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>
        
        {/* Название - фиксированная высота (2 строки) */}
        <Link to={`/product/${product.slug}`} className="block mb-2.5 min-h-[36px]">
          <h3 className="text-sm text-foreground leading-[1.3] line-clamp-2 hover:text-accent transition-colors font-normal">
            {product.name}
          </h3>
        </Link>
        
        {/* Кнопка - прижата к низу */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 h-[36px]"
          aria-label={`Добавить ${product.name} в корзину за ${formatPrice(product.price)}`}
        >
          <ShoppingBag className="w-4 h-4 stroke-2" aria-hidden="true" />
          В корзину
        </button>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id && 
         prevProps.index === nextProps.index;
});

OptimizedProductCard.displayName = 'OptimizedProductCard';
