import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useGetCoursesQuery } from '../../feature/courses/api/courses.api'
import { CourseTable } from '../../feature/admin/components/CourseTable'
import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { ROUTES } from '../../constants/routes'

export default function AdminCoursesPage() {
  const navigate = useNavigate()
  // Fetch all courses (no isPublished filter — admin sees everything including drafts)
  const { data, isLoading } = useGetCoursesQuery({ limit: 100 })
  const courses = data?.courses ?? []

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Courses</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your course catalogue — publish, edit, and delete courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.adminCourseNew())}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Course
        </button>
      </div>

      {/* Summary bar */}
      {!isLoading && courses.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <span>
            <span className="font-semibold text-[var(--text)]">{courses.length}</span> courses
          </span>
          <span>·</span>
          <span>
            <span className="font-semibold text-emerald-400">
              {courses.filter((c) => c.isPublished).length}
            </span>{' '}
            published
          </span>
          <span>·</span>
          <span>
            <span className="font-semibold text-[var(--text)]">
              {courses.filter((c) => !c.isPublished).length}
            </span>{' '}
            drafts
          </span>
        </div>
      )}

      <CourseTable courses={courses} isLoading={isLoading} />
    </AdminLayout>
  )
}
