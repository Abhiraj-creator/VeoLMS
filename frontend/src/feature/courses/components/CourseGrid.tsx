import type { ICourse } from '../../../types/course.types'
import { CourseCard } from './CourseCard'
import { CourseCardSkeleton } from './CourseCardSkeleton'

interface CourseGridProps {
  courses?: ICourse[]
  isLoading?: boolean
  emptyMessage?: string
}

export function CourseGrid({ courses = [], isLoading = false, emptyMessage = 'No courses found for your search' }: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CourseCardSkeleton key={`course-skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center text-[var(--muted)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  )
}
