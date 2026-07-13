import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, PlayCircle } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import type { IRecentProgress } from '../../enrollment/api/enrollment.api'
import { formatDuration } from '../../../utils/formatDuration'

interface ContinueLearningProps {
  recentProgress: IRecentProgress[]
}

export function ContinueLearning({ recentProgress }: ContinueLearningProps) {
  // Find the most recent incomplete lesson, fall back to most recent completed
  const item =
    recentProgress.find((p) => !p.completed) ?? recentProgress[0] ?? null

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-[var(--muted)]" />
        <p className="text-base font-semibold text-[var(--text)]">Nothing to resume yet</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Enroll in a course and start watching to see your progress here.</p>
        <Link
          to={ROUTES.courses()}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          <span>Browse Courses</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const progressPercent = item.totalSeconds > 0
    ? Math.min(100, Math.round((item.watchedSeconds / item.totalSeconds) * 100))
    : 0

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm sm:flex-row">
      {/* Thumbnail */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[var(--surface-2)] sm:h-auto sm:w-52">
        {item.course.thumbnailUrl ? (
          <img
            src={item.course.thumbnailUrl}
            alt={item.course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-transparent">
            <PlayCircle className="h-14 w-14 text-[var(--accent)]/60" />
          </div>
        )}

        {/* Progress overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--surface-3)]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
            Continue Learning
          </p>
          <h2 className="text-xl font-bold text-[var(--text)] leading-snug">{item.lesson.title}</h2>
          <p className="text-sm text-[var(--muted)]">{item.course.title}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <span>{progressPercent}% watched</span>
            {item.totalSeconds > 0 && (
              <span>{formatDuration(item.totalSeconds - item.watchedSeconds)} remaining</span>
            )}
          </div>

          <Link
            to={ROUTES.learn(item.course.slug, item.lesson._id)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Resume Lesson</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
