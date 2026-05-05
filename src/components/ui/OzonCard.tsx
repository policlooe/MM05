import { cn } from "@/lib/utils";

interface OzonCardProps {
  children: React.ReactNode;
  className?: string;
}

export function OzonCard({ children, className }: OzonCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
