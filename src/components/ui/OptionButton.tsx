import { cn } from "@/lib/utils";

interface OptionButtonProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  price?: string;
  className?: string;
}

export function OptionButton({
  children,
  selected,
  onClick,
  disabled = false,
  price,
  className,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-lg border-2 px-4 py-3 text-left transition-all",
        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-background text-muted-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{children}</span>
        {price && (
          <span className={cn("text-sm", selected ? "text-primary" : "text-muted-foreground")}>
            {price}
          </span>
        )}
      </div>
    </button>
  );
}
