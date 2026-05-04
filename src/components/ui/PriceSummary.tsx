// Price Summary - итоговая цена (sticky Ozon style)
// Всегда видна внизу или вверху блока

import { cn } from "@/lib/utils";

interface PriceSummaryProps {
  price: string;
  oldPrice?: string;
  label?: string;
  sticky?: boolean;
  className?: string;
}

export function PriceSummary({
  price,
  oldPrice,
  label = "Итого:",
  sticky = false,
  className,
}: PriceSummaryProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center p-3 border-t bg-white",
        sticky && "sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        {oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {oldPrice}
          </span>
        )}
        <span className="text-xl font-bold text-foreground">{price}</span>
      </div>
    </div>
  );
}
