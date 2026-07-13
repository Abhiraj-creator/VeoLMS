import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, BookOpen, Globe, EyeOff, AlertTriangle, X, Loader2 } from 'lucide-react'
import type { ICourse } from '../../../types/course.types'
import {
  useDeleteCourseMutation,
  useTogglePublishCourseMutation,
} from '../api/admin.api'
import { ROUTES } from '../../../constants/routes'

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  course: ICourse
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

function DeleteConfirmModal({ course, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text)]">Delete Course</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[var(--text)]">"{course.title}"</span>? This will
              permanently remove all sections, lessons, and Cloudinary assets. This action cannot
              be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete permanently'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        published
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-[var(--surface-3)] text-[var(--muted)]',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          published ? 'bg-emerald-400' : 'bg-[var(--muted)]',
        ].join(' ')}
      />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

// ─── Course Table ─────────────────────────────────────────────────────────────

interface CourseTableProps {
  courses: ICourse[]
  isLoading: boolean
}

export function CourseTable({ courses, isLoading }: CourseTableProps) {
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<ICourse | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()
  const [togglePublish] = useTogglePublishCourseMutation()

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteCourse(pendingDelete._id).unwrap()
      setPendingDelete(null)
    } catch (e) {
      console.error('Failed to delete course', e)
    }
  }

  async function handleTogglePublish(course: ICourse) {
    setTogglingId(course._id)
    try {
      await togglePublish(course._id).unwrap()
    } catch (e) {
      console.error('Failed to toggle publish', e)
    } finally {
      setTogglingId(null)
    }
  }

  // Skeleton rows
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="divide-y divide-[var(--border)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-12 w-20 shrink-0 rounded-lg bg-[var(--surface-3)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-[var(--surface-3)]" />
                <div className="h-3 w-1/4 rounded bg-[var(--surface-3)]" />
              </div>
              <div className="h-6 w-16 rounded-full bg-[var(--surface-3)]" />
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--surface-3)]" />
                <div className="h-8 w-8 rounded-lg bg-[var(--surface-3)]" />
                <div className="h-8 w-8 rounded-lg bg-[var(--surface-3)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-16 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-[var(--muted)]" />
        <p className="font-semibold text-[var(--text)]">No courses yet</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Create your first course to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Course
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Status
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Lessons
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Price
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {courses.map((course) => (
                <tr
                  key={course._id}
                  className="group transition-colors hover:bg-[var(--surface-2)]"
                >
                  {/* Thumbnail + Title */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-12 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-20 shrink-0 place-items-center rounded-lg bg-[var(--surface-3)]">
                          <BookOpen className="h-5 w-5 text-[var(--muted)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-[var(--text)]">{course.title}</p>
                        <p className="text-xs text-[var(--muted)] capitalize">{course.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <StatusBadge published={course.isPublished} />
                  </td>

                  {/* Lesson count */}
                  <td className="px-5 py-4 text-center text-[var(--muted)]">
                    {course.totalLessons}
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 text-right font-medium text-[var(--accent)]">
                    ₹{course.price.toLocaleString('en-IN')}
                  </td>

                  {/* Action buttons */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Publish / Unpublish toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(course)}
                        disabled={togglingId === course._id}
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                        className={[
                          'grid h-8 w-8 place-items-center rounded-lg border transition',
                          course.isPublished
                            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]',
                          togglingId === course._id ? 'opacity-50' : '',
                        ].join(' ')}
                      >
                        {togglingId === course._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : course.isPublished ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.adminCourseEdit(course._id))}
                        title="Edit course"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setPendingDelete(course)}
                        title="Delete course"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <DeleteConfirmModal
          course={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
