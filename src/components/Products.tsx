import { useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { OptimizedProductCard } from "./OptimizedProductList";

const filters = ["Все", "Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"] as const;

export const Products = memo(function Products() {
  const [active, setActive] = useState<(typeof filters)[number]>("Все");

  const list = useMemo(() => {
    if (active === "Все") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

  return (
    <section id="products" className="bg-surface-alt py-8 md:py-12">
      <div className="container-x">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-4 mb-6 md:mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold">Популярные товары</h2>
        </motion.div>

        {/* Фильтры — улучшенный дизайн */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin mb-6"
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
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                active === f
                  ? "border-accent bg-accent text-white shadow-accent scale-105"
                  : "border-border bg-surface text-foreground hover:bg-muted hover:shadow-md"
              }`}
            >
              {f}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {list.map((p, index) => (
            <OptimizedProductCard key={p.id} product={p} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});
