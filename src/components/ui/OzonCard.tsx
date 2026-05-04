// Card - базовый блок как в Ozon
// Используется для группировки контента

import { cn } from "@/lib/utils";

interface OzonCardProps {
  children: React.ReactNode;
  className?: string;
}

export function OzonCard({ children, className }: OzonCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-xl p-3 sm:p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
