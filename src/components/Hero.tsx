import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

// Banner data
const banners = [
  {
    id: 1,
    image: heroBanner,
    badge: "Каталог 2026",
    title: "Мебель из массива",
    subtitle: "с доставкой по Дагестану",
    description: "Качественная мебель в Махачкале. Сборка и доставка от 30 000 ₽ — бесплатно.",
    link: "/catalog",
    cta: "Смотреть каталог",
  },
  {
    id: 2,
    image: heroBanner,
    badge: "Новинки 2026",
    title: "Кровати из массива бука",
    subtitle: "Эксклюзивные модели",
    description: "Прочные и красивые кровати ручной работы. Гарантия качества 5 лет.",
    link: "/catalog?category=beds",
    cta: "Смотреть кровати",
  },
  {
    id: 3,
    image: heroBanner,
    badge: "Акция",
    title: "Скидки до 20%",
    subtitle: "на всю мебель из ЛДСП",
    description: "Успейте купить качественную мебель по выгодным ценам. Акция до конца месяца.",
    link: "/catalog?category=wardrobes",
    cta: "Смотреть акции",
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentBanner = banners[currentIndex];

  return (
    <section className="container-x pt-2 md:pt-3">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <Link
          to={currentBanner.link}
          className="relative block rounded-2xl md:rounded-3xl overflow-hidden bg-secondary aspect-[16/11] md:aspect-[21/8] group transition-all shadow-lg hover:shadow-2xl"
          aria-label={currentBanner.cta}
        >
          {/* Banner Images with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentBanner.id}
              src={currentBanner.image}
              alt={currentBanner.title}
              width={1200}
              height={900}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1.01 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] group-hover:-translate-y-2 group-active:scale-100 group-active:opacity-90"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent transition-opacity duration-700 group-hover:opacity-95 group-active:opacity-100" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-6 md:p-12 lg:p-16 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs md:text-sm font-semibold tracking-wider uppercase text-white/80 mb-2 md:mb-3">
                  {currentBanner.badge}
                </p>
                
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.15] text-white mb-3 md:mb-4">
                  {currentBanner.title}
                  <br />
                  <span className="text-white/95">
                    {currentBanner.subtitle}
                  </span>
                </h1>
                
                <p className="text-sm md:text-base text-white/90 max-w-xl mb-5 md:mb-6 leading-relaxed">
                  {currentBanner.description}
                </p>

                <div className="inline-flex">
                  <span className="inline-flex items-center gap-2 bg-white hover:bg-accent text-foreground hover:text-white px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    {currentBanner.cta}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>

        {/* Navigation Arrows - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                goToPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
          </>
        )}

        {/* Dots Indicator - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(index);
                }}
                className={`transition-all ${
                  index === currentIndex
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/75"
                } rounded-full`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
