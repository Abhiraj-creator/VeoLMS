import mongoose from 'mongoose'
import { Progress, type IProgress } from '../models/progress.model'

export class ProgressDAO {
  static upsertProgress(data: {
    studentId: mongoose.Types.ObjectId
    lessonId: mongoose.Types.ObjectId
    courseId: mongoose.Types.ObjectId
    watchedSeconds: number
    totalSeconds: number
    completed: boolean
  }): Promise<IProgress> {
    return Progress.findOneAndUpdate(
      { student: data.studentId, lesson: data.lessonId },
      {
        $set: {
          student: data.studentId,
          lesson: data.lessonId,
          course: data.courseId,
          watchedSeconds: data.watchedSeconds,
          totalSeconds: data.totalSeconds,
          completed: data.completed,
          lastWatchedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    ).exec() as Promise<IProgress>
  }

  static findByLesson(
    studentId: string | mongoose.Types.ObjectId,
    lessonId: string | mongoose.Types.ObjectId
  ): Promise<IProgress | null> {
    return Progress.findOne({ student: studentId, lesson: lessonId }).exec()
  }

  static findByCourse(
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ): Promise<IProgress[]> {
    return Progress.find({ student: studentId, course: courseId }).sort({ lastWatchedAt: -1 }).exec()
  }

  static countCompleted(
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    return Progress.countDocuments({ student: studentId, course: courseId, completed: true }).exec()
  }

  static findRecentByStudent(studentId: string | mongoose.Types.ObjectId): Promise<IProgress[]> {
    return Progress.find({ student: studentId })
      .sort({ lastWatchedAt: -1 })
      .limit(10)
      .populate('lesson', 'title order')
      .populate('course', 'title slug thumbnailUrl')
      .exec()
  }
}
