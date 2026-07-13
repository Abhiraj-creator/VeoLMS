import { useGetAdminStatsQuery } from '../../feature/admin/api/admin.api'
import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { BookOpen, Users, Receipt, TrendingUp, Clock } from 'lucide-react'

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
  loading?: boolean
}

function StatCard({ label, value, icon, sub, loading }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-[var(--surface-3)]" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-[var(--text)]">{value}</p>
          )}
          {sub && !loading && (
            <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p>
          )}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Recent Enrollments Table ─────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery()

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Overview of your LMS platform performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Courses"
          value={stats?.totalCourses ?? 0}
          icon={<BookOpen className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Enrollments"
          value={stats?.totalEnrollments ?? 0}
          icon={<Receipt className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={isLoading ? '' : formatCurrency(stats?.totalRevenue ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
      </div>

      {/* Recent Enrollments */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Recent Enrollments</h2>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {isLoading ? (
            <div className="divide-y divide-[var(--border)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-3)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-[var(--surface-3)]" />
                    <div className="h-3 w-48 animate-pulse rounded bg-[var(--surface-3)]" />
                  </div>
                  <div className="h-3 w-20 animate-pulse rounded bg-[var(--surface-3)]" />
                </div>
              ))}
            </div>
          ) : !stats?.recentEnrollments?.length ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No enrollments yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Course
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stats.recentEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment._id}
                    className="transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {enrollment.student.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{enrollment.student.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {enrollment.course.thumbnailUrl ? (
                          <img
                            src={enrollment.course.thumbnailUrl}
                            alt={enrollment.course.title}
                            className="h-9 w-14 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="grid h-9 w-14 shrink-0 place-items-center rounded-md bg-[var(--surface-3)]">
                            <BookOpen className="h-4 w-4 text-[var(--muted)]" />
                          </div>
                        )}
                        <span className="line-clamp-1 text-[var(--text)]">
                          {enrollment.course.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-[var(--accent)]">
                      {formatCurrency(enrollment.amount)}
                    </td>
                    <td className="px-5 py-4 text-right text-[var(--muted)]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(enrollment.enrolledAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
