// Toggle - переключатель для доп услуг (сборка, матрас и т.д.)
// Ozon style с ценой справа

import { cn } from "@/lib/utils";

interface ToggleProps {
  label: string;
  price: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  price,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between p-3 rounded-lg border transition-all",
        checked ? "border-primary/30 bg-primary/5" : "border-border",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">{label}</span>
          <span className="text-sm font-semibold text-primary shrink-0">
            {price}
          </span>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-primary cursor-pointer shrink-0 mt-0.5"
      />
    </div>
  );
}
