import { Link } from "react-router-dom";
import { useState, memo } from "react";
import { ShoppingBag, Clock } from "lucide-react";
import { formatPrice } from "@/store/cart";
import { OptimizedImage } from "./OptimizedImage";

// Интерфейс для акционного товара
interface PromotionProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  discount: number; // процент скидки
  category: string;
  endsAt?: string; // дата окончания акции (опционально)
}

// Данные акционных товаров (можно вынести в отдельный файл)
const promotionProducts: PromotionProduct[] = [
  {
    id: "1",
    name: "Кровать двуспальная из бука",
    slug: "bed-1",
    image: "/images/products/p-bed-1.jpg",
    oldPrice: 45000,
    newPrice: 31500,
    discount: 30,
    category: "Кровати",
    endsAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Шкаф-купе 3-створчатый",
    slug: "wardrobe",
    image: "/images/products/p-wardrobe.jpg",
    oldPrice: 65000,
    newPrice: 52000,
    discount: 20,
    category: "Шкафы",
  },
  {
    id: "3",
    name: "Обеденный стол из массива",
    slug: "table",
    image: "/images/products/p-table.jpg",
    oldPrice: 38000,
    newPrice: 26600,
    discount: 30,
    category: "Столы",
  },
  {
    id: "4",
    name: "Письменный стол",
    slug: "desk",
    image: "/images/products/p-desk.jpg",
    oldPrice: 28000,
    newPrice: 22400,
    discount: 20,
    category: "Столы",
  },
];

// Функция для расчёта оставшихся дней до окончания акции
const getDaysLeft = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const Promotions = memo(function Promotions() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="promotions" className="py-8 md:py-12">
      <div className="container-x">
        {/* Заголовок секции */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight mb-2">
              Акции и скидки
            </h2>
            <p className="text-sm text-muted-foreground">
              Специальные предложения на популярные товары
            </p>
          </div>
          <Link
            to="/catalog?promo=true"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
          >
            Все товары
          </Link>
        </div>

        {/* Сетка карточек акций с автоскроллом */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="promotion-marquee overflow-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            className="promotion-marquee-track flex w-max gap-3 md:gap-5"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {[...promotionProducts, ...promotionProducts].map((product, index) => {
              const daysLeft = product.endsAt ? getDaysLeft(product.endsAt) : null;

              return (
                <Link
                  key={`${product.id}-${index}`}
                  to={`/product/${product.slug}`}
                  className="promotion-card group bg-surface border border-border rounded-xl overflow-hidden transition-shadow duration-150 flex-shrink-0 w-[280px]"
                  style={{ contain: 'layout style paint' }}
                >
                  <div className="relative aspect-square bg-secondary overflow-hidden">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ aspectRatio: '1/1' }}
                    />

                    {/* Бейдж скидки */}
                    <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      −{product.discount}%
                    </div>

                    {/* Таймер акции (если есть) */}
                    {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                      <div className="absolute top-2 right-2 bg-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 stroke-2" />
                        {daysLeft}д
                      </div>
                    )}

                    {/* Кнопка "В корзину" при hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg">
                        <ShoppingBag className="w-4 h-4 stroke-2" />
                        В корзину
                      </span>
                    </div>
                  </div>

                  {/* Информация о товаре */}
                  <div className="p-3.5 md:p-4">
                    {/* Категория */}
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {product.category}
                    </p>

                    {/* Название */}
                    <h3 className="text-sm font-medium mb-3 line-clamp-2 leading-snug min-h-[2.8rem]">
                      {product.name}
                    </h3>

                    {/* Цены */}
                    <div className="space-y-1.5">
                      {/* Старая цена */}
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.oldPrice)}
                      </p>

                      {/* Новая цена */}
                      <div className="flex items-baseline gap-2">
                        <p className="text-base font-bold text-accent">
                          {formatPrice(product.newPrice)}
                        </p>
                        <p className="text-xs text-accent font-semibold">
                          −{formatPrice(product.oldPrice - product.newPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Кнопка "Все товары" для мобильных */}
        <div className="mt-6 md:hidden">
          <Link
            to="/catalog?promo=true"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            Посмотреть все товары
          </Link>
        </div>
      </div>
    </section>
  );
});
