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
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-all",
        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-background",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-all",
            selected
              ? "border-primary bg-primary"
              : "border-gray-300 bg-white"
          )}
        >
          {selected && (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <span className={cn("text-sm font-medium", selected ? "text-primary" : "text-muted-foreground")}>
        {price}
      </span>
    </button>
  );
}
