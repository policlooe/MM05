// Option Button - главный элемент Ozon UI
// Используется для выбора размера, цвета, изголовья и т.д.

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionButtonProps {
  selected: boolean;
  children: React.ReactNode;
  price?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function OptionButton({
  selected,
  children,
  price,
  onClick,
  disabled = false,
  className,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full sm:w-auto",
        "px-3 py-2",
        "rounded-lg border text-sm",
        "transition-all duration-200",
        "flex items-center justify-between gap-2",
        "active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/5 text-primary shadow-sm"
          : "border-border bg-white hover:border-primary/40",
        disabled && "opacity-50 cursor-not-allowed hover:border-border",
        className
      )}
    >
      <span className="truncate font-medium">{children}</span>

      {price && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {price}
        </span>
      )}

      {selected && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}
