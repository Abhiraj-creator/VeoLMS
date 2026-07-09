import mongoose from 'mongoose'
import { Enrollment, type IEnrollment, type EnrollmentStatus } from '../models/enrollment.model'

export class EnrollmentDAO {
  static findByStudentAndCourse(
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ): Promise<IEnrollment | null> {
    return Enrollment.findOne({ student: studentId, course: courseId, status: 'completed' }).exec()
  }

  static findAnyByStudentAndCourse(
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ): Promise<IEnrollment | null> {
    return Enrollment.findOne({ student: studentId, course: courseId }).exec()
  }

  static findByOrderId(razorpayOrderId: string): Promise<IEnrollment | null> {
    return Enrollment.findOne({ razorpayOrderId }).exec()
  }

  static create(data: {
    student: mongoose.Types.ObjectId
    course: mongoose.Types.ObjectId
    razorpayOrderId: string
    amount: number
    status?: EnrollmentStatus
  }): Promise<IEnrollment> {
    return Enrollment.create(data)
  }

  static upsertCompleted(razorpayOrderId: string, razorpayPaymentId: string): Promise<IEnrollment | null> {
    return Enrollment.findOneAndUpdate(
      { razorpayOrderId },
      {
        $set: {
          status: 'completed',
          razorpayPaymentId,
        },
      },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('course', 'title slug')
      .exec()
  }

  static findMyEnrollments(studentId: string | mongoose.Types.ObjectId): Promise<IEnrollment[]> {
    return Enrollment.find({ student: studentId, status: 'completed' })
      .populate('course')
      .populate('lastWatchedLesson')
      .sort({ enrolledAt: -1 })
      .exec()
  }

  static async findAllEnrollments(
    filters: Partial<Pick<IEnrollment, 'status' | 'course' | 'student'>>,
    page = 1,
    limit = 20
  ): Promise<{ enrollments: IEnrollment[]; total: number }> {
    const skip = (page - 1) * limit
    const [enrollments, total] = await Promise.all([
      Enrollment.find(filters)
        .populate('student', 'name email')
        .populate('course', 'title slug')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Enrollment.countDocuments(filters).exec(),
    ])

    return { enrollments, total }
  }

  static updateProgress(
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId,
    progressPercent: number,
    lastLessonId: string | mongoose.Types.ObjectId
  ): Promise<IEnrollment | null> {
    return Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId, status: 'completed' },
      {
        $set: {
          progressPercent,
          lastWatchedLesson: lastLessonId,
        },
      },
      { returnDocument: 'after', runValidators: true }
    ).exec()
  }
}
