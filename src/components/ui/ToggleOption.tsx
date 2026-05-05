import { cn } from "@/lib/utils";

interface ToggleOptionProps {
  label: string;
  price?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleOption({
  label,
  price,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all",
        "hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20",
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{label}</span>
          {price && (
            <span className={cn("text-sm font-medium", checked ? "text-primary" : "text-muted-foreground")}>
              {price}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </label>
  );
}
