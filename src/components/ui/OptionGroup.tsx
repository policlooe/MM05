import { cn } from "@/lib/utils";

interface OptionGroupProps {
  title: string;
  value?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function OptionGroup({
  title,
  value,
  required = false,
  children,
  className,
}: OptionGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {title}
          {required && <span className="ml-1 text-destructive">*</span>}
        </h3>
        {value && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
