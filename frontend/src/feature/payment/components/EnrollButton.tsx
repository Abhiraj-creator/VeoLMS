import { Link } from 'react-router-dom'
import { ArrowRight, CreditCard } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import type { ICourse } from '../../../types/course.types'
import type { IEnrollment } from '../../../types/enrollment.types'
import { useAuth } from '../../../feature/auth/hooks/useAuth'
import { Button } from '../../../shared/components/ui/Button'
import { useRazorpay } from '../hooks/useRazorpay'

interface EnrollButtonProps {
  course: ICourse
  firstLessonId: string
  enrollment?: IEnrollment | null
}

export function EnrollButton({ course, firstLessonId, enrollment }: EnrollButtonProps) {
  const { isAuthenticated } = useAuth()
  const { startPayment, isProcessing } = useRazorpay()

  if (enrollment?.status === 'completed') {
    const lessonId = enrollment.lastWatchedLesson?._id ?? firstLessonId
    return (
      <Link
        to={ROUTES.learn(course.slug, lessonId)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90"
      >
        <span>Continue Learning</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.login(ROUTES.courseDetails(course.slug))}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90"
      >
        <span>Login to Enroll</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <Button
      type="button"
      className="w-full"
      loading={isProcessing}
      onClick={() => startPayment(course, firstLessonId)}
    >
      <CreditCard className="h-4 w-4" />
      <span>Enroll Now</span>
    </Button>
  )
}
