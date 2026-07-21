import { Skeleton } from '../../../shared/components/ui/Skeleton';

export function LessonSidebarSkeleton() {
  return (
    <div className="w-full h-full p-4 space-y-6 bg-white dark:bg-[#111111] border-r border-neutral-200 dark:border-[#1F1F1F]">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-4 pt-2">
        {[1, 2, 3].map((sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-100 dark:bg-[#1A1A1A]">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="pl-3 space-y-2">
              {[1, 2].map((lessonIndex) => (
                <div key={lessonIndex} className="flex items-center gap-3 p-2 rounded-lg">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
