import { Skeleton } from '@/components/ui/skeleton';

export function HeroSkeleton() {
  return (
    <div className="container-x pt-2 md:pt-3 px-3 md:px-0">
      <Skeleton className="w-full aspect-[16/11] md:aspect-[21/8] rounded-xl md:rounded-3xl" />
    </div>
  );
}
