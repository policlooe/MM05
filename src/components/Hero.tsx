import { memo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { OptimizedImage } from "./OptimizedImage";
import heroBanner from "@/assets/hero-banner.jpg";

gsap.registerPlugin(useGSAP);

const ROTATION_INTERVAL_MS = 5200;

const banners = [
  {
    id: 1,
    image: heroBanner,
    eyebrow: "MM05",
    title: "Мебель из массива",
    subtitle: "Чистые формы. Натуральное дерево.",
    link: "/catalog",
    cta: "Каталог",
  },
  {
    id: 2,
    image: heroBanner,
    eyebrow: "Спальня",
    title: "Кровати",
    subtitle: "Спокойная геометрия для дома.",
    link: "/catalog?cat=Кровати",
    cta: "Смотреть",
  },
  {
    id: 3,
    image: heroBanner,
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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const slides = gsap.utils.toArray<HTMLElement>("[data-hero-slide]", root);
      const images = gsap.utils.toArray<HTMLElement>(".hero-image", root);
      const copy = root.querySelector<HTMLElement>("[data-hero-copy]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
      gsap.set(slides[0], { autoAlpha: 1, zIndex: 2 });
      gsap.set(images, { scale: 1.02, transformOrigin: "50% 50%" });
      if (copy) {
        gsap.set(copy, { autoAlpha: 1, y: 0 });
      }

      if (reduceMotion || slides.length <= 1) return;

      const showSlide = (nextIndex: number) => {
        const currentIndex = activeIndexRef.current;
        if (nextIndex === currentIndex) return;

        const currentSlide = slides[currentIndex];
        const nextSlide = slides[nextIndex];
        const nextImage = images[nextIndex];

        activeIndexRef.current = nextIndex;

        timelineRef.current?.kill();
        const tl = gsap.timeline({ defaults: { ease: "power2.out", overwrite: "auto" } });
        timelineRef.current = tl;

        if (copy) {
          tl.to(copy, {
            autoAlpha: 0,
            y: -6,
            duration: 0.22,
            onComplete: () => setActiveIndex(nextIndex),
          }, 0);
        } else {
          setActiveIndex(nextIndex);
        }

        tl
          .set(nextSlide, { zIndex: 3, autoAlpha: 1 })
          .set(currentSlide, { zIndex: 2 })
          .fromTo(nextImage, { scale: 1.05 }, { scale: 1, duration: 1.4 }, 0)
          .to(copy, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.24)
          .to(currentSlide, { autoAlpha: 0, duration: 0.65 }, 0.1)
          .set(currentSlide, { zIndex: 0 });
      };

      const start = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          showSlide((activeIndexRef.current + 1) % slides.length);
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
        timelineRef.current?.kill();
        timelineRef.current = null;
        root.removeEventListener("pointerenter", handlePointerEnter);
        root.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    },
    { scope: rootRef }
  );

  const currentBanner = banners[activeIndex];

  return (
    <section ref={rootRef} className="container-x px-3 pt-2 md:px-0 md:pt-3" aria-label="Главный баннер">
      <div className="hero-composite-layer relative isolate">
        <Link
          to={currentBanner.link}
          className="hero-frame group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow hover:shadow-md sm:aspect-[16/9] lg:aspect-[16/7]"
          aria-label={`${currentBanner.cta}: ${currentBanner.title}`}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              data-hero-slide
              className={`hero-slide absolute inset-0 ${index === 0 ? "z-[2] opacity-100" : "z-0 opacity-0"}`}
              aria-hidden={index !== activeIndex}
            >
              <OptimizedImage
                src={banner.image}
                alt={banner.title}
                width={1200}
                height={675}
                priority={index === 0}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
                className="hero-image h-full w-full object-cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.44)_50%,rgba(0,0,0,0.62)_100%)] pointer-events-none" />
            </div>
          ))}
          <div className="hero-text-vignette absolute inset-0 z-[5] pointer-events-none" />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-6 py-8 text-center text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div data-hero-copy className="hero-copy-shell mx-auto flex max-w-[560px] flex-col items-center">
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
