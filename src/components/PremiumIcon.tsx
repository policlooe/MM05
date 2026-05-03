import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Общие классы для Lucide: чуть более «ювелирный» контур, как в премиальных интерфейсах */
export const premiumIconSvg =
  "[&_svg]:stroke-[1.15] [&_svg]:stroke-foreground/78 [&_svg]:fill-none";

const frameSize = {
  sm: "h-9 w-9 min-w-[2.25rem] [&_svg]:h-[18px] [&_svg]:w-[18px]",
  md: "h-11 w-11 min-w-[2.75rem] [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 min-w-[3.5rem] [&_svg]:h-7 [&_svg]:w-7",
};

type FrameProps = {
  size?: keyof typeof frameSize;
  className?: string;
  children: ReactNode;
  /** Нейтральный камень / лёгкий «металл» или акцент бренда */
  tone?: "neutral" | "accent";
};

/**
 * Подложка под иконку: мягкий градиент + внутренний блик (витринный стиль).
 */
export function PremiumIconFrame({ size = "md", tone = "neutral", className, children }: FrameProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_1px_3px_rgba(15,35,25,0.07)]",
        tone === "accent"
          ? "bg-gradient-to-br from-accent/18 via-accent/8 to-muted/45"
          : "bg-gradient-to-br from-background via-muted/35 to-muted/75",
        premiumIconSvg,
        frameSize[size],
        className
      )}
    >
      {children}
    </span>
  );
}

type MarkProps = {
  icon: LucideIcon;
  size?: keyof typeof frameSize;
  tone?: FrameProps["tone"];
  className?: string;
};

/** Иконка Lucide в готовой премиальной рамке */
export function PremiumIconMark({ icon: Icon, size = "md", tone = "neutral", className }: MarkProps) {
  return (
    <PremiumIconFrame size={size} tone={tone} className={className}>
      <Icon aria-hidden />
    </PremiumIconFrame>
  );
}
