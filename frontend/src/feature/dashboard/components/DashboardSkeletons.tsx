import { Skeleton } from '../../../shared/components/ui/Skeleton';

export function ContinueLearningSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#1F1F1F] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Skeleton className="w-full sm:w-40 aspect-video rounded-xl" />
        <div className="flex-1 space-y-2 w-full">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="pt-2">
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnrolledCourseCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#1F1F1F] space-y-4">
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function RecentlyWatchedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#1F1F1F]">
          <Skeleton className="w-16 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}
