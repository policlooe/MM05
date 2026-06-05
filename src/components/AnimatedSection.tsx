import { ElementType, ReactNode, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface AnimatedSectionProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  id?: string;
  "aria-label"?: string;
}

export function AnimatedSection({
  as: Component = "section",
  children,
  className,
  itemSelector = "[data-reveal]",
  ...props
}: AnimatedSectionProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const items = gsap.utils.toArray<HTMLElement>(itemSelector, scope.current);

      if (!items.length) return;

      if (reduceMotion) {
        gsap.set(items, { autoAlpha: 1, y: 0, clearProps: "transform,opacity,visibility" });
        return;
      }

      gsap.set(items, { autoAlpha: 0, y: 18, willChange: "transform,opacity" });

      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        interval: 0.08,
        batchMax: 6,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.07,
            overwrite: "auto",
            clearProps: "transform,opacity,visibility,willChange",
          });
        },
      });
    },
    { scope }
  );

  return (
    <Component ref={scope} className={cn(className)} {...props}>
      {children}
    </Component>
  );
}
