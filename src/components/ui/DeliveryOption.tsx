// Delivery Option - опция доставки (Ozon radio cards)
// Используется для выбора способа доставки

import { cn } from "@/lib/utils";

interface DeliveryOptionProps {
  label: string;
  price: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function DeliveryOption({
  label,
  price,
  selected,
  onClick,
  disabled = false,
  className,
}: DeliveryOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex justify-between items-center",
        "p-3 rounded-lg border text-sm",
        "transition-all active:scale-[0.99]",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40",
        disabled && "opacity-50 cursor-not-allowed hover:border-border",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
            selected ? "border-primary" : "border-border"
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <span className={cn("font-medium", selected && "text-primary")}>
          {label}
        </span>
      </div>
      <span
        className={cn(
          "font-semibold shrink-0",
          selected ? "text-primary" : "text-muted-foreground"
        )}
      >
        {price}
      </span>
    </button>
  );
}
