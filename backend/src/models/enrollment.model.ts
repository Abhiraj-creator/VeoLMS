import mongoose, { Schema, type Document } from 'mongoose'

export type EnrollmentStatus = 'pending' | 'completed' | 'failed'

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId: string | null
  amount: number
  status: EnrollmentStatus
  lastWatchedLesson: mongoose.Types.ObjectId | null
  progressPercent: number
  enrolledAt: Date
  updatedAt: Date
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    lastWatchedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })
enrollmentSchema.index({ course: 1, status: 1 })
enrollmentSchema.index({ enrolledAt: -1 })

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema)
