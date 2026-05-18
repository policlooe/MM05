import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border p-2.5 flex flex-col">
      <Skeleton className="aspect-square rounded-lg mb-2.5" />
      <Skeleton className="h-4 w-20 mb-1.5" />
      <Skeleton className="h-3 w-full mb-2.5" />
      <Skeleton className="h-3 w-3/4 mb-2.5" />
      <Skeleton className="h-9 w-full rounded-lg mt-auto" />
    </div>
  );
}
