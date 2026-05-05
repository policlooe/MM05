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
        "border-t bg-white p-4",
        sticky && "sticky bottom-0 z-10 shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {oldPrice}
            </span>
          )}
          <span className="text-2xl font-bold text-foreground">{price}</span>
        </div>
      </div>
    </div>
  );
}
