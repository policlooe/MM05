import { ElementType, ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  id?: string;
  "aria-label"?: string;
}

/**
 * Появление блоков при скролле на IntersectionObserver + CSS-переходах.
 *
 * Раньше здесь был GSAP + ScrollTrigger: ~27 КБ gzip в первой загрузке ради
 * fade-in секций главной страницы. Поведение то же, JS-зависимость убрана.
 */
export function AnimatedSection({
  as: Component = "section",
  children,
  className,
  itemSelector = "[data-reveal]",
  ...props
}: AnimatedSectionProps) {
  const scope = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    items.forEach((item, index) => {
      const delay = Math.min(index, 5) * 70;
      item.style.opacity = "0";
      item.style.transform = "translateY(18px)";
      item.style.transition = `opacity 550ms ease ${delay}ms, transform 550ms ease ${delay}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "translateY(0)";
          observer.unobserve(target);

          window.setTimeout(() => {
            target.style.transition = "";
            target.style.transform = "";
          }, 900);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [itemSelector]);

  return (
    <Component ref={scope} className={cn(className)} {...props}>
      {children}
    </Component>
  );
}
