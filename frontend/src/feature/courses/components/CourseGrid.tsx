import type { ICourse } from '../../../types/course.types'
import { CourseCard } from './CourseCard'
import { CourseCardSkeleton } from './CourseCardSkeleton'
import { EmptyState } from '../../../shared/components/ui/EmptyState'

interface CourseGridProps {
  courses?: ICourse[]
  isLoading?: boolean
  emptyMessage?: string
  onResetFilters?: () => void
}

export function CourseGrid({ courses = [], isLoading = false, emptyMessage = 'No courses found for your search', onResetFilters }: CourseGridProps) {
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
      <EmptyState
        title={emptyMessage}
        description="Try adjusting your search query or selecting a different category filter."
        actionLabel={onResetFilters ? "Reset Filters" : undefined}
        onAction={onResetFilters}
      />
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
