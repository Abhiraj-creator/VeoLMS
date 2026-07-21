import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import type { EnrollmentByDay } from '../api/admin.api'

interface EnrollmentTimelineChartProps {
  data: EnrollmentByDay[]
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-56 rounded-lg bg-[var(--border)]" />
      <div className="h-[280px] w-full rounded-xl bg-[var(--border)]" />
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
        <p className="mt-1 text-lg font-bold text-[var(--text)]">
          {payload[0].value}{' '}
          <span className="text-sm font-normal text-[var(--muted)]">
            enrollment{payload[0].value !== 1 ? 's' : ''}
          </span>
        </p>
      </div>
    )
  }
  return null
}

// Format "YYYY-MM-DD" → "Jun 12"
function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function EnrollmentTimelineChart({ data, isLoading }: EnrollmentTimelineChartProps) {
  if (isLoading) return <Skeleton />

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-center">
        <p className="font-semibold text-[var(--text)]">No enrollment data</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Enrollments over time will appear here once students sign up.</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    count: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#enrollGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--background)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
