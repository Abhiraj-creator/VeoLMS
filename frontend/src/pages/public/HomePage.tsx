import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { CourseGrid } from '../../feature/courses/components/CourseGrid'
import { useGetCoursesQuery } from '../../feature/courses/api/courses.api'

export default function HomePage() {
  const { data, isLoading } = useGetCoursesQuery({ limit: 6, page: 1 })
  const courses = data?.courses ?? []

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span>Project-based learning for builders</span>
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-[var(--text)] sm:text-6xl">
            Learn. Build. Ship.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            VeoLMS gives you structured courses, real progress tracking, and a clean path from
            first lesson to shipped project.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.courses()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <span>Browse courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.signup()}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(255,255,255,0.02))] p-6 shadow-[var(--shadow)]">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Trending</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text)]">5 Courses</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                <p className="mt-3 text-sm text-[var(--muted)]">Real payment flow</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <p className="mt-3 text-sm text-[var(--muted)]">Secure auth + refresh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Featured</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--text)]">
              Trending courses
            </h2>
          </div>
          <Link to={ROUTES.courses()} className="text-sm text-[var(--accent)]">
            View all
          </Link>
        </div>
        <CourseGrid courses={courses} isLoading={isLoading} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--text)]">Learn by building</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Every course ends in something you can point to, not just notes you forgot.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--text)]">Progress tracking</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Resume where you left off with lesson-level progress and dashboard history.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--text)]">Secure payments</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Enrollment flows through the same auth and payment path the backend expects.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        <span className="text-[var(--text)]">{courses.length || 5} Courses</span>
        <span>100% Project Based</span>
        <span>Real Payment Flow</span>
        <span>Progress Tracking</span>
      </section>
    </div>
  )
}
