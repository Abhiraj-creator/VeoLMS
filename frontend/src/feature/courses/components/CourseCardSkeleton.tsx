export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="aspect-video animate-pulse bg-[var(--surface-2)]" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--surface-2)]" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--surface-2)]" />
        </div>
        <div className="h-5 w-4/5 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  )
}
