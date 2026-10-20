import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";
import heroBanner from "@/assets/hero-banner.jpg";

const ROTATION_INTERVAL_MS = 5200;
const FADE_OUT_MS = 180;

const banners = [
  {
    id: 1,
    eyebrow: "MM05",
    title: "Мебель из массива",
    subtitle: "Чистые формы. Натуральное дерево.",
    link: "/catalog",
    cta: "Каталог",
  },
  {
    id: 2,
    eyebrow: "Спальня",
    title: "Кровати",
    subtitle: "Спокойная геометрия для дома.",
    link: "/catalog?cat=Кровати",
    cta: "Смотреть",
  },
  {
    id: 3,
    eyebrow: "Акции",
    title: "До 20%",
    subtitle: "На выбранные модели.",
    link: "/catalog?promo=true",
    cta: "Перейти",
  },
];

export const Hero = memo(function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyVisible, setCopyVisible] = useState(true);

  // Ротация баннеров на CSS-переходах: раньше здесь стоял GSAP (~27 КБ gzip),
  // который грузился в первую отрисовку ради одного fade заголовка.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || banners.length <= 1) return;

    const showSlide = (nextIndex: number) => {
      if (nextIndex === activeIndexRef.current) return;
      activeIndexRef.current = nextIndex;

      setCopyVisible(false);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = window.setTimeout(() => {
        setActiveIndex(nextIndex);
        setCopyVisible(true);
      }, FADE_OUT_MS);
    };

    const start = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        showSlide((activeIndexRef.current + 1) % banners.length);
      }, ROTATION_INTERVAL_MS);
    };

    const stop = () => {
      if (!intervalRef.current) return;
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const handlePointerEnter = () => stop();
    const handlePointerLeave = () => start();
    const handleVisibility = () => (document.hidden ? stop() : start());

    root.addEventListener("pointerenter", handlePointerEnter);
    root.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const currentBanner = banners[activeIndex];

  return (
    <section ref={rootRef} className="container-x px-3 pt-2 md:px-0 md:pt-3" aria-label="Главный баннер">
      <div className="hero-composite-layer relative isolate">
        <Link
          to={currentBanner.link}
          className="hero-frame group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow hover:shadow-md sm:aspect-[16/9] lg:aspect-[16/7]"
          aria-label={`${currentBanner.cta}: ${currentBanner.title}`}
        >
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              src={heroBanner}
              alt="Интерьер с мебелью из массива"
              width={1200}
              height={675}
              priority
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="hero-image h-full w-full object-cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.44)_50%,rgba(0,0,0,0.62)_100%)] pointer-events-none" />
          </div>
          <div className="hero-text-vignette absolute inset-0 z-[5] pointer-events-none" />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-6 py-8 text-center text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div
              data-hero-copy
              className="hero-copy-shell mx-auto flex max-w-[560px] flex-col items-center"
              style={{
                opacity: copyVisible ? 1 : 0,
                transition: `opacity ${copyVisible ? 280 : FADE_OUT_MS}ms ease`,
              }}
            >
              <p className="hero-copy-kicker mb-3 text-[11px] font-medium uppercase text-white sm:text-xs">
                {currentBanner.eyebrow}
              </p>
              <h1 className="hero-copy-title text-[2.5rem] font-semibold leading-[0.96] text-white sm:text-5xl lg:text-6xl">
                {currentBanner.title}
              </h1>
              <p className="hero-copy-subtitle mx-auto mt-4 max-w-[340px] text-sm font-normal leading-snug text-white sm:text-base">
                {currentBanner.subtitle}
              </p>
              <span className="pointer-events-auto mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 group-hover:bg-white/95">
                {currentBanner.cta}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
});
