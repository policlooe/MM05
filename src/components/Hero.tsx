import { useState, useEffect, memo, useCallback } from "react";
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

  useEffect(() => {
    banners.forEach((banner) => {
      const img = new Image();
      img.src = banner.image;
    });
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  // Passive touch handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setIsAutoPlaying(false);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setIsAutoPlaying(false);
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd]);

  const currentBanner = banners[currentIndex];

  return (
    <section className="container-x pt-2 md:pt-3 px-3 md:px-0" aria-label="Главный баннер">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hero-composite-layer relative isolate"
      >
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Баннер {currentIndex + 1} из {banners.length}: {currentBanner.title}
        </div>
        
        <Link
          to={currentBanner.link}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="hero-frame relative block rounded-xl md:rounded-3xl overflow-hidden bg-secondary group transition-shadow shadow-sm hover:shadow-lg touch-pan-y z-0"
          style={{ aspectRatio: "16 / 9" }}
          aria-label={currentBanner.cta}
        >
          <div className="absolute inset-0 flex-shrink-0">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={false}
                animate={{ opacity: index === currentIndex ? 1 : 0 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="hero-slide absolute inset-0"
                aria-hidden={index !== currentIndex}
              >
                <OptimizedImage
                  src={banner.image}
                  alt={banner.title}
                  width={1200}
                  height={675}
                  priority={true}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="hero-image w-full h-full object-cover flex-shrink-0"
                />
              </motion.div>
            ))}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent pointer-events-none" />

          {/* Text content - responsive typography with max-width and line-clamp */}
          <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-4 md:p-8 lg:p-12">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-2 md:space-y-3"
                >
                  {/* Badge - responsive text */}
                  <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/80 line-clamp-1">
                    {currentBanner.badge}
                  </p>
                  
                  {/* Title - responsive with line-clamp to prevent overflow */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white max-w-prose">
                    <span className="block line-clamp-2">
                      {currentBanner.title}
                    </span>
                    <span className="block text-white/90 line-clamp-1 mt-1">
                      {currentBanner.subtitle}
                    </span>
                  </h1>
                  
                  {/* Description - responsive with line-clamp */}
                  <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed line-clamp-2 md:line-clamp-3">
                    {currentBanner.description}
                  </p>

                  {/* CTA button - hidden on mobile */}
                  <div className="hidden md:inline-flex pt-2">
                    <span className="inline-flex items-center gap-2 bg-white hover:bg-accent text-foreground hover:text-white px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold text-sm shadow-xl transition-colors duration-300">
                      {currentBanner.cta}
                      <ChevronRight className="w-4 h-4 stroke-2" />
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Link>

        {/* Navigation Arrows - Desktop only */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                goToPrev();
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Предыдущий баннер"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1.5] text-foreground" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                goToNext();
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label="Следующий баннер"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.5] text-foreground" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
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
