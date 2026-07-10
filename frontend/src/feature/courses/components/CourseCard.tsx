import { Link } from 'react-router-dom'
import { Clock3, PlayCircle, Tag } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { formatDuration, formatPrice } from '../../../utils/formatDuration'
import type { ICourse } from '../../../types/course.types'
import { cn } from '../../../utils/cn'

const badgeClasses: Record<string, string> = {
  Frontend: 'bg-sky-500/15 text-sky-300',
  Backend: 'bg-emerald-500/15 text-emerald-300',
  Fullstack: 'bg-violet-500/15 text-violet-300',
  Other: 'bg-stone-500/15 text-stone-300',
}

function getInstructor(course: ICourse): string {
  if (typeof course.createdBy === 'string') {
    return 'VeoLMS Instructor'
  }

  return course.createdBy.name || 'VeoLMS Instructor'
}

export function CourseCard({ course }: { course: ICourse }) {
  return (
    <Link
      to={ROUTES.courseDetails(course.slug)}
      className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
    >
      <div className="aspect-video overflow-hidden bg-[var(--surface-2)]">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(255,255,255,0.02))]">
            <PlayCircle className="h-10 w-10 text-[var(--accent)]" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              badgeClasses[course.category] ?? badgeClasses.Other
            )}
          >
            <Tag className="h-3 w-3" />
            {course.category}
          </span>
          <span className="text-sm font-semibold text-[var(--accent)]">
            {formatPrice(course.price)}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-[var(--text)]">
          {course.title}
        </h3>

        <p className="text-sm text-[var(--muted)]">{getInstructor(course)}</p>

        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>{course.totalLessons} lessons</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {formatDuration(course.totalDuration)}
          </span>
        </div>
      </div>
    </Link>
  )
}
