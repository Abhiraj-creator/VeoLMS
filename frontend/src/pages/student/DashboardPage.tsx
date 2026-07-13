import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useGetMyEnrollmentsQuery, useGetRecentProgressQuery } from '../../feature/enrollment/api/enrollment.api'
import { useAuth } from '../../feature/auth/hooks/useAuth'
import { ContinueLearning } from '../../feature/dashboard/components/ContinueLearning'
import { EnrolledCourseCard } from '../../feature/dashboard/components/EnrolledCourseCard'
import { RecentlyWatched } from '../../feature/dashboard/components/RecentlyWatched'
import { ROUTES } from '../../constants/routes'

// Skeleton for EnrolledCourseCard
function CourseCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="aspect-video w-full bg-[var(--surface-3)]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-[var(--surface-3)]" />
        <div className="h-4 w-3/4 rounded bg-[var(--surface-3)]" />
        <div className="h-2 w-full rounded bg-[var(--surface-3)]" />
        <div className="h-9 w-full rounded-lg bg-[var(--surface-3)]" />
      </div>
    </div>
  )
}

// Skeleton for ContinueLearning
function ContinueLearningSkeleton() {
  return (
    <div className="animate-pulse flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] sm:flex-row">
      <div className="h-48 w-full bg-[var(--surface-3)] sm:h-auto sm:w-52" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-[var(--surface-3)]" />
          <div className="h-6 w-3/4 rounded bg-[var(--surface-3)]" />
          <div className="h-4 w-1/2 rounded bg-[var(--surface-3)]" />
        </div>
        <div className="h-11 w-40 rounded-xl bg-[var(--surface-3)]" />
      </div>
    </div>
  )
}

// Skeleton for RecentlyWatched list
function RecentListSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="h-12 w-20 shrink-0 rounded-md bg-[var(--surface-3)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-[var(--surface-3)]" />
            <div className="h-4 w-2/3 rounded bg-[var(--surface-3)]" />
          </div>
          <div className="h-3 w-16 rounded bg-[var(--surface-3)]" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useGetMyEnrollmentsQuery()
  const { data: recentProgress = [], isLoading: recentLoading } = useGetRecentProgressQuery()

  // Only show completed enrollments on dashboard
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed')
  const hasEnrollments = completedEnrollments.length > 0

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">
          Welcome back, <span className="text-[var(--accent)]">{firstName}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pick up where you left off or explore new courses.
        </p>
      </div>

      {/* Section A — Continue Learning */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Continue Learning</h2>
        {recentLoading ? (
          <ContinueLearningSkeleton />
        ) : (
          <ContinueLearning recentProgress={recentProgress} />
        )}
      </section>

      {/* Section B — My Courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">My Courses</h2>
          <Link
            to={ROUTES.courses()}
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Browse more
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {enrollmentsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : hasEnrollments ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completedEnrollments.map((enrollment) => (
              <EnrolledCourseCard key={enrollment._id} enrollment={enrollment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-[var(--muted)]" />
            <p className="text-base font-semibold text-[var(--text)]">You haven't enrolled in any courses yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Explore our library and start learning today.</p>
            <Link
              to={ROUTES.courses()}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              <span>Browse Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Section C — Recently Watched */}
      {(recentLoading || recentProgress.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Recently Watched</h2>
          {recentLoading ? <RecentListSkeleton /> : <RecentlyWatched items={recentProgress} />}
        </section>
      )}
    </div>
  )
}
