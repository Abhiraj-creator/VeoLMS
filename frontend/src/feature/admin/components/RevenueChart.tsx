import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenuePerCourse } from '../api/admin.api'

interface RevenueChartProps {
  data: RevenuePerCourse[]
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-48 rounded-lg bg-[var(--border)]" />
      <div className="h-[280px] w-full rounded-xl bg-[var(--border)]" />
    </div>
  )
}

// Custom tooltip
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
        <p className="text-xs font-semibold text-[var(--muted)] truncate max-w-[180px]">{label}</p>
        <p className="mt-1 text-lg font-bold text-[var(--accent)]">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) return <Skeleton />

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-center">
        <p className="font-semibold text-[var(--text)]">No revenue data</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Revenue will appear once students enroll in courses.</p>
      </div>
    )
  }

  // Truncate long course titles for the X axis
  const chartData = data.map((item) => ({
    ...item,
    shortTitle: item.courseTitle.length > 16 ? item.courseTitle.slice(0, 14) + '…' : item.courseTitle,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="shortTitle"
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar
          dataKey="totalRevenue"
          fill="var(--accent)"
          radius={[6, 6, 0, 0]}
          maxBarSize={56}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
