import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted hover:text-muted-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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
