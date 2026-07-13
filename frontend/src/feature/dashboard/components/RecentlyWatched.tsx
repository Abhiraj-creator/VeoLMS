import { Link } from 'react-router-dom'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import type { IRecentProgress } from '../../enrollment/api/enrollment.api'
import { cn } from '../../../utils/cn'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface RecentlyWatchedProps {
  items: IRecentProgress[]
}

export function RecentlyWatched({ items }: RecentlyWatchedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] italic">No lessons watched yet. Start a course to see your activity here.</p>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {items.map((item) => (
        <Link
          key={item._id}
          to={ROUTES.learn(item.course.slug, item.lesson._id)}
          className="flex items-center gap-4 px-4 py-3 transition hover:bg-[var(--surface-2)] group"
        >
          {/* Thumbnail */}
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--surface-2)]">
            {item.course.thumbnailUrl ? (
              <img
                src={item.course.thumbnailUrl}
                alt={item.course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-transparent">
                <PlayCircle className="h-5 w-5 text-[var(--accent)]/60" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[var(--muted)]">{item.course.title}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition">
              {item.lesson.title}
            </p>
          </div>

          {/* Status + time */}
          <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-[var(--muted)]">
            <span>{timeAgo(item.lastWatchedAt)}</span>
            <span className={cn('flex items-center gap-1', item.completed ? 'text-emerald-400' : 'text-[var(--muted)]')}>
              {item.completed ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </>
              ) : (
                <>
                  <PlayCircle className="h-3 w-3" />
                  In Progress
                </>
              )}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
