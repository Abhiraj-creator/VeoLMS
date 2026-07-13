import { Link } from 'react-router-dom'
import { BookOpen, Clock3, ArrowRight } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { formatDuration } from '../../../utils/formatDuration'
import type { IEnrollment } from '../../../types/enrollment.types'
import { cn } from '../../../utils/cn'

interface EnrolledCourseCardProps {
  enrollment: IEnrollment
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps) {
  const { course, progressPercent, lastWatchedLesson } = enrollment
  const lessonId = lastWatchedLesson?._id ?? ''

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:shadow-[var(--shadow)] hover:border-[var(--accent)]/40">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-2)]">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-transparent">
            <BookOpen className="h-12 w-12 text-[var(--accent)]/60" />
          </div>
        )}

        {/* Progress overlay badge */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {progressPercent}%
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{course.category}</span>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--accent)] transition">
            {course.title}
          </h3>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDuration(course.totalDuration)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            {progressPercent === 100 ? '✅ Completed' : `${progressPercent}% complete`}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <Link
            to={lessonId ? ROUTES.learn(course.slug, lessonId) : ROUTES.courseDetails(course.slug)}
            className={cn(
              'inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition',
              progressPercent === 100
                ? 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
                : 'bg-[var(--accent)] text-white hover:opacity-90'
            )}
          >
            <span>{progressPercent === 100 ? 'Review' : 'Continue'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
