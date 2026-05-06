import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export function Hero() {
  return (
    <section className="container-x pt-2 md:pt-3">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to="/catalog"
          className="relative block rounded-2xl md:rounded-3xl overflow-hidden bg-secondary aspect-[16/11] md:aspect-[21/8] group ring-1 ring-border/60 hover:ring-accent/50 transition-all shadow-lg hover:shadow-2xl"
          aria-label="Перейти в каталог"
        >
        <img
          src={heroBanner}
          alt="Мебель из массива дерева ручной работы — MM05"
          width={1200}
          height={900}
          className="absolute inset-0 w-full h-full object-cover scale-[1.01] transition-[transform,opacity] duration-1000 ease-out group-hover:scale-[1.08] group-hover:-translate-y-2 group-active:scale-100 group-active:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent transition-opacity duration-700 group-hover:opacity-95 group-active:opacity-100" />

        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-6 md:p-12 lg:p-16 max-w-2xl">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs md:text-sm font-semibold tracking-wider uppercase text-white/80 mb-2 md:mb-3"
          >
            Каталог 2026
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.15] text-white mb-3 md:mb-5"
          >
            Мебель из массива
            <br />
            <span className="text-white/95">
              с доставкой по Дагестану
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm md:text-base text-white/90 max-w-xl mb-5 md:mb-6 leading-relaxed"
          >
            Качественная мебель в Махачкале. Сборка и доставка от 30 000 ₽ — бесплатно.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="inline-flex"
          >
            <span className="inline-flex items-center gap-2 bg-white hover:bg-accent text-foreground hover:text-white px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
              Смотреть каталог
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.div>
        </div>
      </Link>
      </motion.div>
    </section>
  );
}
