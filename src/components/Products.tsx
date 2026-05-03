import { useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { useCart, formatPrice } from "@/store/cart";
import { toast } from "sonner";

const filters = ["Все", "Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"] as const;

// Мемоизированная карточка товара с премиум анимациями
const ProductCard = memo(({ product, index }: { product: typeof products[0]; index: number }) => {
  const { add } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
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
          <p className="text-[10px] md:text-xs text-muted-foreground line-through mb-1">{formatPrice(product.oldPrice)}</p>
        )}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-[11px] md:text-xs text-foreground/80 leading-tight mb-2 line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <motion.button
          onClick={() => {
            add(product);
            toast.success("✓ Добавлено в корзину", { 
              description: product.name,
              duration: 2000
            });
          }}
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
});

ProductCard.displayName = "ProductCard";

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
          <ProductCard key={p.id} product={p} index={index} />
        ))}
      </div>
    </section>
  );
}
