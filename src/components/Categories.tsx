import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, Percent, type LucideIcon } from "lucide-react";
import { categories } from "@/data/products";

const tiles: { title: string; sub: string; href: string; icon: LucideIcon }[] = [
  { title: "Каталог", sub: "Вся мебель", href: "/catalog", icon: Store },
  { title: "Акции", sub: "Скидки до -30%", href: "#promotions", icon: Percent },
];

export function Categories() {
  return (
    <section id="categories" className="container-x py-3 md:py-4 space-y-4 md:space-y-5">
      {/* Плитки каталога и акций - улучшенная адаптивность */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
        {tiles.map((t, index) => {
          const Icon = t.icon;
          const inner = (
            <>
              {/* Иконка - фиксированный размер */}
              <div className="flex items-center justify-center mb-2 md:mb-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-accent/10 transition-all group-hover:bg-accent/20"
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent stroke-[1.5]" />
                </motion.div>
              </div>

              {/* Текст - выровнен по центру */}
              <div className="text-center">
                <p className="text-sm md:text-base font-semibold leading-tight text-foreground mb-1">
                  {t.title}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                  {t.sub}
                </p>
              </div>
            </>
          );
          
          // Единый класс для всех плиток - одинаковая высота и пропорции
          const tileClass = "group border border-border bg-surface rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center transition-all hover:shadow-lg hover:-translate-y-1 active:translate-y-0 min-h-[140px] md:min-h-[160px]";
          
          const MotionWrapper = motion(t.href.startsWith("/") ? Link : "a");
          
          return (
            <MotionWrapper
              key={t.title}
              to={t.href.startsWith("/") ? t.href : undefined}
              href={!t.href.startsWith("/") ? t.href : undefined}
              className={tileClass}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ y: -4 }}
            >
              {inner}
            </MotionWrapper>
          );
        })}
      </div>

      {/* Категории товаров */}
      <div>
        <h2 className="font-serif text-lg md:text-xl font-semibold mb-3 md:mb-4 px-0.5">
          Категории
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/catalog?cat=${encodeURIComponent(c.name)}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-border bg-secondary mb-2 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-active:translate-y-0">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover opacity-[0.94] group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <p className="text-xs md:text-sm font-medium leading-tight text-foreground">
                {c.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.count} моделей
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

