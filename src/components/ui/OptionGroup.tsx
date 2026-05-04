// Option Group - группа опций (размер / цвет / изголовье)
// Ozon style с заголовком и выбранным значением справа

import { cn } from "@/lib/utils";

interface OptionGroupProps {
  title: string;
  value?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function OptionGroup({
  title,
  value,
  children,
  required = false,
  className,
}: OptionGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground">
          {title}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </h3>
        {value && (
          <span className="text-xs text-muted-foreground">{value}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}
