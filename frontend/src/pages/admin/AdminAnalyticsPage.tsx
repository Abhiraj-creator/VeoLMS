import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { useGetAdminAnalyticsQuery } from '../../feature/admin/api/admin.api'
import { RevenueChart } from '../../feature/admin/components/RevenueChart'
import { EnrollmentTimelineChart } from '../../feature/admin/components/EnrollmentTimelineChart'

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string
  subtitle: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-[var(--background)] p-2 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-[var(--text)]">{title}</h2>
          <p className="text-sm text-[var(--muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useGetAdminAnalyticsQuery()

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Revenue breakdown and enrollment trends across your platform.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue Per Course"
          subtitle="Total revenue earned per course"
          icon={BarChart2}
        >
          <RevenueChart
            data={analytics?.revenuePerCourse ?? []}
            isLoading={isLoading}
          />
        </ChartCard>

        <ChartCard
          title="Enrollments Over Time"
          subtitle="New enrollments over the last 30 days"
          icon={TrendingUp}
        >
          <EnrollmentTimelineChart
            data={analytics?.enrollmentsByDay ?? []}
            isLoading={isLoading}
          />
        </ChartCard>
      </div>

      {/* Summary stats below charts */}
      {!isLoading && analytics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Revenue (All Courses)
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--text)]">
              ₹
              {analytics.revenuePerCourse
                .reduce((sum, c) => sum + c.totalRevenue, 0)
                .toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Enrollments (Last 30 Days)
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--text)]">
              {analytics.enrollmentsByDay.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
