import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { OptimizedProductCard } from "./OptimizedProductList";

const filters = ["Все", "Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"] as const;

export function Products() {
  const [active, setActive] = useState<(typeof filters)[number]>("Все");

  const list = useMemo(() => {
    if (active === "Все") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

  return (
    <section id="products" className="container-x py-4 md:py-5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between gap-4 mb-2.5 md:mb-3"
      >
        <h2 className="font-serif text-base md:text-lg lg:text-xl font-semibold">Популярные товары</h2>
      </motion.div>

      {/* Фильтры — горизонтальный скролл на мобиле */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1.5 overflow-x-auto pb-2.5 -mx-1 px-1 scrollbar-none"
      >
        {filters.map((f, i) => (
          <motion.button
            key={f}
            onClick={() => setActive(f)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-medium transition-all border ${
              active === f
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-transparent bg-secondary text-foreground hover:bg-muted hover:border-border"
            }`}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 mt-3">
        {list.map((p, index) => (
          <OptimizedProductCard key={p.id} product={p} index={index} />
        ))}
      </div>
    </section>
  );
}
