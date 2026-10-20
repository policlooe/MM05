import { useRecentlyViewed } from "@/store/recentlyViewed";
import { OptimizedProductCard } from "./OptimizedProductList";
import { Clock } from "lucide-react";

export function RecentlyViewed() {
  const { products } = useRecentlyViewed();

  // Не показываем если нет просмотренных товаров
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-surface">
      <div className="container-x">
        <div className="flex items-center gap-3 mb-6 md:mb-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">
              Недавно просмотренные
            </h2>
            <p className="text-sm text-muted-foreground">
              Товары, которые вы смотрели ранее
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {products.slice(0, 6).map((product, index) => (
            <OptimizedProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
