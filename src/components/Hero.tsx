import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
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

export const Hero = memo(function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Prevent default only when needed (not passive)
  const handleTouchMoveWithPrevent = (e: React.TouchEvent) => {
    handleTouchMove(e);
    // Don't prevent default to allow scrolling
  };

  const currentBanner = banners[currentIndex];

  return (
    <section className="container-x pt-2 md:pt-3 px-3 md:px-0" aria-label="Главный баннер">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Баннер {currentIndex + 1} из {banners.length}: {currentBanner.title}
        </div>
        
        <Link
          to={currentBanner.link}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMoveWithPrevent}
          onTouchEnd={handleTouchEnd}
          className="banner ios-gpu-optimized relative block rounded-xl md:rounded-3xl overflow-hidden bg-secondary group transition-shadow shadow-sm hover:shadow-lg touch-pan-y"
          style={{ aspectRatio: "16 / 9" }}
          aria-label={currentBanner.cta}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="banner ios-gpu-optimized absolute inset-0"
            >
              <OptimizedImage
                src={currentBanner.image}
                alt={currentBanner.title}
                width={1200}
                height={900}
                priority={true}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                style={{ aspectRatio: '16/9' }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-4 md:p-12 lg:p-16 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xs md:text-sm font-semibold tracking-wider uppercase text-white/80 mb-1.5 md:mb-3">
                  {currentBanner.badge}
                </p>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] text-white mb-1.5 md:mb-4">
                  {currentBanner.title}
                  <br />
                  <span className="text-white/90">
                    {currentBanner.subtitle}
                  </span>
                </h1>
                
                <p className="text-sm md:text-base text-white/80 max-w-xl mb-3 md:mb-6 leading-relaxed">
                  {currentBanner.description}
                </p>

                <div className="hidden md:inline-flex">
                  <span className="inline-flex items-center gap-2 bg-white hover:bg-accent text-foreground hover:text-white px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    {currentBanner.cta}
                    <ChevronRight className="w-4 h-4 stroke-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>

        {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                goToPrev();
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1.5] text-foreground" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                goToNext();
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.5] text-foreground" />
            </button>
          </>
        )}

        {/* Dots Indicator - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" role="group" aria-label="Навигация по баннерам">
            {banners.map((banner, index) => (
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
                aria-label={`Перейти к баннеру: ${banner.title}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
});
