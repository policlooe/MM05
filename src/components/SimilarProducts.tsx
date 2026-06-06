import { useMemo } from "react";
import { products as allProducts, type Product } from "@/data/products";
import { OptimizedProductCard } from "./OptimizedProductList";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SimilarProductsProps {
  currentProduct: Product;
  limit?: number;
}

export function SimilarProducts({ currentProduct, limit = 4 }: SimilarProductsProps) {
  const similarProducts = useMemo(() => {
    // Фильтруем товары той же категории, исключая текущий
    let similar = allProducts.filter(
      (p) => p.category === currentProduct.category && p.id !== currentProduct.id
    );

    // Сортируем по близости цены
    similar = similar.sort((a, b) => {
      const diffA = Math.abs(a.price - currentProduct.price);
      const diffB = Math.abs(b.price - currentProduct.price);
      return diffA - diffB;
    });

    return similar.slice(0, limit);
  }, [currentProduct, limit]);

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-surface-alt">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6 md:mb-8"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">
              Похожие товары
            </h2>
            <p className="text-sm text-muted-foreground">
              Вам также может понравиться
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {similarProducts.map((product, index) => (
            <OptimizedProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
