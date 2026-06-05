import { useMemo, useState, memo } from "react";
import { products } from "@/data/products";
import { OptimizedProductCard } from "./OptimizedProductList";
import { AnimatedSection } from "./AnimatedSection";

const filters = ["Все", "Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"] as const;

export const Products = memo(function Products() {
  const [active, setActive] = useState<(typeof filters)[number]>("Все");

  const list = useMemo(() => {
    if (active === "Все") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

  return (
    <AnimatedSection id="products" className="bg-surface-alt py-8 md:py-12">
      <div className="container-x">
        <div data-reveal className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">Популярные товары</h2>
        </div>

        {/* Фильтры — улучшенный дизайн */}
        <div data-reveal className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                active === f
                  ? "border-accent bg-accent text-white shadow-accent scale-105"
                  : "border-border bg-surface text-foreground hover:bg-muted hover:shadow-md"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {list.map((p, index) => (
            <div key={p.id} data-reveal>
              <OptimizedProductCard product={p} index={index} />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
});
