import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";
import heroBanner from "@/assets/hero-banner.jpg";

const ROTATION_INTERVAL_MS = 5200;

const banners = [
  {
    id: 1,
    image: heroBanner,
    badge: "MM05",
    title: "Мебель из массива",
    subtitle: "Спокойные формы для дома.",
    link: "/catalog",
    cta: "В каталог",
  },
  {
    id: 2,
    image: heroBanner,
    badge: "Массив бука",
    title: "Кровати",
    subtitle: "Чистая линия. Прочная основа.",
    link: "/catalog?category=beds",
    cta: "Смотреть",
  },
  {
    id: 3,
    image: heroBanner,
    badge: "Акция",
    title: "Скидки до 20%",
    subtitle: "На выбранные модели.",
    link: "/catalog?category=wardrobes",
    cta: "Перейти",
  },
];

export const Hero = memo(function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    banners.forEach((banner) => {
      const img = new Image();
      img.src = banner.image;
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const currentBanner = banners[currentIndex];

  return (
    <section className="container-x pt-2 md:pt-3 px-3 md:px-0" aria-label="Главный баннер">
      <div className="hero-composite-layer relative isolate">
        <Link
          to={currentBanner.link}
          className="hero-frame relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow hover:shadow-md sm:aspect-[16/9] lg:aspect-[16/7]"
          aria-label={`${currentBanner.cta}: ${currentBanner.title}`}
        >
          <div className="hero-slide absolute inset-0 flex-shrink-0">
            <OptimizedImage
              src={currentBanner.image}
              alt={currentBanner.title}
              width={1200}
              height={675}
              priority={true}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="hero-image h-full w-full flex-shrink-0 object-cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10 pointer-events-none" />

          <div className="relative z-10 flex h-full items-center justify-center p-6 text-center text-white sm:p-8 lg:p-12">
            <div className="mx-auto max-w-[620px]">
              <p className="mb-3 text-xs font-medium uppercase text-white/75 sm:text-sm">
                {currentBanner.badge}
              </p>
              <h1 className="text-3xl font-semibold leading-[1.05] text-white sm:text-4xl lg:text-6xl">
                {currentBanner.title}
              </h1>
              <p className="mx-auto mt-3 max-w-[360px] text-sm font-normal leading-snug text-white/85 sm:text-base lg:text-lg">
                {currentBanner.subtitle}
              </p>
              <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-white/95 px-5 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 group-hover:bg-white">
                {currentBanner.cta}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
});
