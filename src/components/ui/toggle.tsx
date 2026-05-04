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
    <label
      className={cn(
        "flex items-start justify-between p-3 rounded-lg border transition-all cursor-pointer select-none",
        checked ? "border-accent/40 bg-accent/5" : "border-border hover:border-border/80",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">{label}</span>
          <span className="text-sm font-semibold text-accent shrink-0">{price}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-accent cursor-pointer shrink-0 mt-0.5"
      />
    </label>
  );
}
