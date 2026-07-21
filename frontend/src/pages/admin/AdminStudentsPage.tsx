import { useState, useMemo, useEffect } from 'react'
import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { Search, ChevronDown, ChevronRight, BookOpen, Calendar, Mail, User } from 'lucide-react'
import {
  useGetAdminStudentsQuery,
  useGetStudentEnrollmentsQuery,
} from '../../feature/admin/api/admin.api'
import type { IUser } from '../../types/user.types'
import type { IEnrollment } from '../../types/enrollment.types'
import { EmptyState } from '../../shared/components/ui/EmptyState'


// ─── Enrollment Detail Row ──────────────────────────────────────────────────

function EnrollmentDetailRow({ enrollment }: { enrollment: IEnrollment }) {
  const progress = Math.round(enrollment.progressPercent ?? 0)

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        {enrollment.course.thumbnailUrl ? (
          <img
            src={enrollment.course.thumbnailUrl}
            alt={enrollment.course.title}
            className="h-8 w-12 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-8 w-12 shrink-0 rounded bg-[var(--border)] flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-[var(--muted)]" />
          </div>
        )}
        <span className="truncate font-medium text-[var(--text)]">{enrollment.course.title}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[var(--muted)] font-mono w-8">{progress}%</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            enrollment.status === 'completed'
              ? 'bg-green-500/15 text-green-400'
              : enrollment.status === 'pending'
                ? 'bg-yellow-500/15 text-yellow-400'
                : 'bg-red-500/15 text-red-400'
          }`}
        >
          {enrollment.status}
        </span>
        <span className="text-xs text-[var(--muted)] font-mono">
          ₹{enrollment.amount.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

// ─── Expanded Enrollments Panel ─────────────────────────────────────────────

function StudentEnrollments({ studentId }: { studentId: string }) {
  const { data: enrollments, isLoading } = useGetStudentEnrollmentsQuery(studentId)

  if (isLoading) {
    return (
      <div className="py-4 space-y-2 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-[var(--border)]" />
        ))}
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <p className="py-4 text-sm text-[var(--muted)]">This student has no enrollments yet.</p>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {enrollments.map((e) => (
        <EnrollmentDetailRow key={e._id} enrollment={e} />
      ))}
    </div>
  )
}

// ─── Student Table Row ───────────────────────────────────────────────────────

function StudentRow({ student }: { student: IUser }) {
  const [expanded, setExpanded] = useState(false)

  const joinDate = new Date(student.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <tr
        className={`border-b border-[var(--border)] transition-colors cursor-pointer hover:bg-[var(--surface)] ${
          expanded ? 'bg-[var(--surface)]' : ''
        }`}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Avatar + Name */}
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-3">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                {initials}
              </div>
            )}
            <span className="font-medium text-[var(--text)] text-sm">{student.name}</span>
          </div>
        </td>

        {/* Email */}
        <td className="py-3 px-3 text-sm text-[var(--muted)] hidden sm:table-cell">
          {student.email}
        </td>

        {/* Enrolled courses */}
        <td className="py-3 px-3 text-sm text-[var(--text)] hidden sm:table-cell font-mono">
          {student.enrollmentCount ?? 0}
        </td>

        {/* Join Date */}
        <td className="py-3 px-3 text-sm text-[var(--muted)] hidden md:table-cell font-mono">
          {joinDate}
        </td>

        {/* Expand toggle */}
        <td className="py-3 pl-3 pr-4 text-right">
          <button
            type="button"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
      </tr>

      {/* Expanded enrollments row */}
      {expanded && (
        <tr className="border-b border-[var(--border)] bg-[var(--background)]">
          <td colSpan={5} className="px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Enrollments
            </p>
            <StudentEnrollments studentId={student._id} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Table Skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[var(--border)] px-4 py-4"
        >
          <div className="h-8 w-8 rounded-full bg-[var(--border)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-[var(--border)]" />
            <div className="h-2 w-56 rounded bg-[var(--border)]" />
          </div>
          <div className="h-3 w-20 rounded bg-[var(--border)] hidden md:block" />
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(id)
  }, [search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const { data, isLoading } = useGetAdminStudentsQuery({
    q: debouncedSearch || undefined,
    page,
  })

  const students = useMemo(() => data?.students ?? [], [data])
  const total = data?.total ?? 0
  const limit = data?.limit ?? 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Students</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {isLoading ? 'Loading…' : `${total} registered student${total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Column headers */}
        <div className="border-b border-[var(--border)] bg-[var(--background)] px-4 py-2 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <User className="h-3.5 w-3.5" /> Student
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <Mail className="h-3.5 w-3.5" /> Email
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <BookOpen className="h-3.5 w-3.5" /> Courses
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <Calendar className="h-3.5 w-3.5" /> Joined
          </div>
          <div /> {/* expand column */}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : students.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No students found"
              description={debouncedSearch ? `No results found for "${debouncedSearch}". Try clearing or changing your search term.` : 'Students will appear here once they register on the platform.'}
              actionLabel={debouncedSearch ? "Clear Search" : undefined}
              onAction={debouncedSearch ? () => setSearch('') : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {students.map((student) => (
                  <StudentRow key={student._id} student={student} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
