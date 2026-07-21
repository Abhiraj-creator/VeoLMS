import { Skeleton } from '../../../shared/components/ui/Skeleton';

export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#1F1F1F] space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-[#1F1F1F] overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-[#1F1F1F] flex justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-100 dark:border-[#1A1A1A] last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#1F1F1F] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="w-full h-64 rounded-xl" />
    </div>
  );
}
