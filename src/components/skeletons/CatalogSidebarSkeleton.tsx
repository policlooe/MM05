import { Skeleton } from '@/components/ui/skeleton';

export function CatalogSidebarSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-6 w-24 rounded" />
      {Array(5).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full rounded" />
      ))}
    </div>
  );
}
