import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, PlayCircle, ChevronDown, ChevronUp, BookOpen, Clock3, User2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useGetCourseBySlugQuery } from '../../feature/courses/api/courses.api'
import { useGetMyEnrollmentsQuery } from '../../feature/enrollment/api/enrollment.api'
import { useAuth } from '../../feature/auth/hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { Spinner } from '../../shared/components/ui/Spinner'
import { useToast } from '../../shared/components/ui/Toast'
import { formatDuration } from '../../utils/formatDuration'
import { EnrollButton } from '../../feature/payment/components/EnrollButton'
import { apiClient } from '../../shared/libs/axios'
import type { ISection, ILesson } from '../../types/course.types'

interface PreviewState {
  lesson: ILesson
  videoUrl: string
}

function LessonRow({
  lesson,
  locked,
  onPreview,
  onLocked,
}: {
  lesson: ILesson
  locked: boolean
  onPreview: (lesson: ILesson) => void
  onLocked: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => (lesson.isPreview ? onPreview(lesson) : locked ? onLocked() : onPreview(lesson))}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--surface-2)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        {lesson.isPreview ? (
          <PlayCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        ) : (
          <Lock className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        )}
        <span className="truncate text-sm text-[var(--text)]">{lesson.title}</span>
      </div>
      <span className="shrink-0 text-xs text-[var(--muted)]">{formatDuration(lesson.duration)}</span>
    </button>
  )
}

export default function CourseDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, user } = useAuth()
  const { data, isLoading, isError } = useGetCourseBySlugQuery(slug)
  const { data: enrollments } = useGetMyEnrollmentsQuery(undefined, { skip: !isAuthenticated })
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const course = data?.course
  const curriculum = data?.curriculum ?? []

  const enrolledEnrollment = useMemo(
    () => enrollments?.find((item) => item.course.slug === slug) ?? null,
    [enrollments, slug]
  )

  const firstLessonId = curriculum[0]?.lessons?.[0]?._id ?? ''

  async function openVideo(lesson: ILesson) {
    try {
      const response = await apiClient.get(`/courses/${slug}/video`, {
        params: { lessonId: lesson._id },
      })
      const videoUrl = response.data?.data?.videoUrl as string | undefined

      if (!videoUrl) {
        throw new Error('Video not available')
      }

      setPreview({ lesson, videoUrl })
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? 'Unable to load video'
          : 'Unable to load video'
      toast.error(message)
    }
  }

  function handleLockedLesson() {
    if (!isAuthenticated) {
      navigate(ROUTES.login(ROUTES.courseDetails(slug)))
      return
    }

    toast.info('Enroll to access this lesson.')
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner label="Loading course" />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--muted)]">
        Course not found.
      </div>
    )
  }

  const isOwned = enrolledEnrollment?.status === 'completed'
  const sanitizedDescription = DOMPurify.sanitize(course.description)

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,rgba(249,115,22,0.2),rgba(255,255,255,0.02))]">
                <BookOpen className="h-12 w-12 text-[var(--accent)]" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span className="rounded-full border border-[var(--border)] px-3 py-1">{course.category}</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {formatDuration(course.totalDuration)}
              </span>
              <span>{course.totalLessons} lessons</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-[var(--text)]">{course.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                {course.shortDescription || course.description}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">About this course</h2>
            <div
              className="prose prose-invert mt-4 max-w-none prose-p:text-[var(--muted)] prose-li:text-[var(--muted)]"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text)]">Curriculum</h2>
            <div className="space-y-3">
              {curriculum.map((section: ISection) => (
                <details
                  key={section._id}
                  open={section.order === 1}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                    <span className="text-sm font-medium text-[var(--text)]">
                      {section.order}. {section.title}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[var(--muted)] open:hidden" />
                    <ChevronUp className="hidden h-4 w-4 text-[var(--muted)] open:block" />
                  </summary>
                  <div className="space-y-1 border-t border-[var(--border)] px-2 py-2">
                    {section.lessons?.map((lesson) => (
                      <LessonRow
                        key={lesson._id}
                        lesson={lesson}
                        locked={!lesson.isPreview && !isOwned && user?.role !== 'admin'}
                        onPreview={openVideo}
                        onLocked={handleLockedLesson}
                      />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:sticky lg:top-24">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Enrollment</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">₹{course.price}</p>
            </div>

            <div className="space-y-2 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4" />
                <span>Instructor: VeoLMS Team</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
            </div>

            <EnrollButton course={course} firstLessonId={firstLessonId} enrollment={enrolledEnrollment} />

            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>Lifetime access to the course</li>
              <li>Progress tracking and resume support</li>
              <li>Preview lessons available before enrollment</li>
            </ul>
          </div>
        </aside>
      </section>

      {preview ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--text)]">{preview.lesson.title}</p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)]"
              >
                Close
              </button>
            </div>
            <video src={preview.videoUrl} controls autoPlay className="w-full rounded-lg bg-black" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
