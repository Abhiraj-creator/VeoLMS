import { useParams } from 'react-router-dom'
import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { Construction } from 'lucide-react'

export default function AdminCourseFormPage() {
  const { courseId } = useParams()

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {courseId ? 'Edit Course' : 'Create Course'}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Course curriculum builder — coming in Phase 17.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 text-center">
        <Construction className="mb-3 h-10 w-10 text-[var(--muted)]" />
        <p className="font-semibold text-[var(--text)]">Coming soon</p>
        <p className="mt-1 text-sm text-[var(--muted)]">The curriculum builder will be built in Phase 17.</p>
      </div>
    </AdminLayout>
  )
}
