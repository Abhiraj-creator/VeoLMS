import type { ICourse, ILesson } from './course.types'

export type EnrollmentStatus = 'pending' | 'completed' | 'failed'

export interface IEnrollment {
  _id: string
  student: string
  course: ICourse
  razorpayOrderId: string
  razorpayPaymentId: string | null
  amount: number
  status: EnrollmentStatus
  lastWatchedLesson: ILesson | null
  progressPercent: number
  enrolledAt: string
  updatedAt: string
}
