import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
          className="relative block rounded-xl md:rounded-2xl overflow-hidden bg-secondary aspect-[16/11] md:aspect-[21/8] group ring-1 ring-border/60 hover:ring-accent/30 transition-all"
          aria-label="Перейти в каталог"
        >
        <img
          src={heroBanner}
          alt="Мебель из массива дерева ручной работы — MM05"
          width={1200}
          height={900}
          className="absolute inset-0 w-full h-full object-cover scale-[1.01] transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.05] group-hover:-translate-y-1 group-active:scale-100 group-active:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/30 md:to-transparent transition-opacity duration-500 group-hover:opacity-90 group-active:opacity-100" />

        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-5 md:p-10 max-w-lg">
          <p className="text-[10px] md:text-xs font-medium tracking-wide text-white/75 mb-1.5 opacity-0 translate-y-2 animate-[fade-in-up_0.55s_ease_forwards] [animation-delay:0.2s]">
            Каталог 2026
          </p>
          <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-semibold leading-[1.08] text-white">
            Мебель из массива
            <br />
            <span className="text-white/95">с доставкой по Дагестану</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-white/80 max-w-sm opacity-0 translate-y-2 animate-[fade-in-up_0.6s_ease_forwards] [animation-delay:0.35s]">
            Качественная мебель в Махачкале. Сборка и доставка от 30 000 ₽ — бесплатно.
          </p>
        </div>
      </Link>
      </motion.div>
    </section>
  );
}
