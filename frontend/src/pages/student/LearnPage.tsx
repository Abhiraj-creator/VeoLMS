import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import DOMPurify from 'dompurify'

import { useGetCourseBySlugQuery } from '../../feature/courses/api/courses.api'
import {
  useGetCourseProgressQuery,
} from '../../feature/learn/api/learn.api'
import { useVideoPlayer } from '../../feature/learn/hooks/useVideoPlayer'
import { useProgressTracker } from '../../feature/learn/hooks/useProgressTracker'
import { useLearnNavigation } from '../../feature/learn/hooks/useLearnNavigation'
import { LessonSidebar } from '../../feature/learn/components/LessonSidebar'
import { LearnLayout } from '../../feature/learn/components/LearnLayout'
import { VideoPlayer } from '../../feature/learn/components/VideoPlayer'
import { Spinner } from '../../shared/components/ui/Spinner'
import { ROUTES } from '../../constants/routes'

export default function LearnPage() {
  const { slug = '', lessonId = '' } = useParams()
  const navigate = useNavigate()

  const { data: courseDetail, isLoading: isCourseLoading } = useGetCourseBySlugQuery(slug)
  const course = courseDetail?.course
  const curriculum = courseDetail?.curriculum ?? []

  const { data: progress = [] } = useGetCourseProgressQuery(
    course?._id ?? '',
    { skip: !course?._id }
  )

  const isActiveLessonCompleted = useMemo(() => {
    return progress.find((p) => p.lessonId === lessonId)?.completed ?? false
  }, [progress, lessonId])

  const { videoUrl, isLoading: isVideoLoading, isError: isVideoError, setPlayer } = useVideoPlayer({
    courseSlug: slug,
    lessonId,
  })

  const { handleTimeUpdate } = useProgressTracker({
    lessonId,
    courseId: course?._id ?? '',
  })

  const { nextLesson, prevLesson, navigateToLesson } = useLearnNavigation({
    courseSlug: slug,
    curriculum,
    currentLessonId: lessonId,
    isLessonCompleted: isActiveLessonCompleted,
  })

  const activeLesson = useMemo(() => {
    const cur = courseDetail?.curriculum ?? []
    for (const section of cur) {
      const found = section.lessons?.find((l) => l._id === lessonId)
      if (found) return { lesson: found, section }
    }
    return null
  }, [courseDetail?.curriculum, lessonId])

  const sanitizedContent = useMemo(() => {
    return activeLesson?.lesson.content ? DOMPurify.sanitize(activeLesson.lesson.content) : ''
  }, [activeLesson])

  const isForbidden = useMemo(() => {
    if (!isVideoError) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = isVideoError as any
    return err.status === 403 || err.data?.statusCode === 403
  }, [isVideoError])

  if (isCourseLoading) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[var(--bg)]">
        <Spinner label="Loading course curriculum..." />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[var(--bg)] p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-[var(--text)]">Course Not Found</h2>
          <p className="text-[var(--muted)]">
            We couldn't find the course you're looking for. Please check the URL or return to dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const sidebar = (
    <LessonSidebar
      courseTitle={course.title}
      sections={curriculum}
      activeLessonId={lessonId}
      progress={progress}
      onLessonSelect={navigateToLesson}
      onBackToDashboard={() => navigate('/dashboard')}
    />
  )

  const handleEnded = () => {
    if (nextLesson) {
      navigateToLesson(nextLesson._id)
    }
  }

  return (
    <LearnLayout sidebar={sidebar} lessonTitle={activeLesson?.lesson.title}>
      {isForbidden ? (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] max-w-md mx-auto space-y-4 shadow-lg my-12">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-xl font-bold text-[var(--text)]">Access Locked</h3>
          <p className="text-sm text-[var(--muted)]">
            You are not enrolled in this course or your subscription is invalid. Please enroll to access this content.
          </p>
          <Link
            to={ROUTES.courseDetails(slug)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
          >
            View Course Details
          </Link>
        </div>
      ) : isVideoError ? (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] max-w-md mx-auto space-y-4 shadow-lg my-12">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-xl font-bold text-[var(--text)]">Error Loading Video</h3>
          <p className="text-sm text-[var(--muted)]">
            We couldn't retrieve the signed video stream from the server. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Player */}
          {isVideoLoading ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-[var(--border)] bg-black">
              <Spinner label="Loading video player..." />
            </div>
          ) : (
            <VideoPlayer
              videoUrl={videoUrl}
              onReady={setPlayer}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && navigateToLesson(prevLesson._id)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:hover:bg-[var(--surface)]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && navigateToLesson(nextLesson._id)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-50 disabled:hover:bg-[var(--surface)]"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Active Lesson details */}
          {activeLesson && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold mb-1">
                  Section {activeLesson.section.order} • Lesson {activeLesson.lesson.order}
                </p>
                <h1 className="text-2xl font-bold text-[var(--text)]">{activeLesson.lesson.title}</h1>
              </div>

              {sanitizedContent ? (
                <div
                  className="prose prose-invert max-w-none text-[var(--muted)] prose-p:text-[var(--muted)] prose-li:text-[var(--muted)]"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <p className="text-sm text-[var(--muted)] italic">No description available for this lesson.</p>
              )}
            </div>
          )}
        </div>
      )}
    </LearnLayout>
  )
}
export { LearnPage }
