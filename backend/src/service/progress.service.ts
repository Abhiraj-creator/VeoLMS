import mongoose from 'mongoose'
import { CourseDAO } from '../Dao/course.dao'
import { EnrollmentDAO } from '../Dao/enrollment.dao'
import { LessonDAO } from '../Dao/lesson.dao'
import { ProgressDAO } from '../Dao/progress.dao'
import { SectionDAO } from '../Dao/section.dao'
import { AppError, ForbiddenError, NotFoundError } from '../middleware/errorHandler.middleware'
import type { ProgressInput } from '../validators/progress.validators'

function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid ID', 400)
  }
  return new mongoose.Types.ObjectId(id)
}

async function countLessonsInCourse(courseId: mongoose.Types.ObjectId): Promise<number> {
  const sections = await SectionDAO.listByCourse(courseId, true)
  if (sections.length === 0) return 0

  const counts = await Promise.all(
    sections.map((section) => LessonDAO.countBySection(section._id))
  )
  return counts.reduce((total, count) => total + count, 0)
}

export class ProgressService {
  static async saveProgress(userId: mongoose.Types.ObjectId, input: ProgressInput) {
    const lessonId = toObjectId(input.lessonId)
    const courseId = toObjectId(input.courseId)

    const [course, lesson, enrollment, existingProgress] = await Promise.all([
      CourseDAO.findById(courseId),
      LessonDAO.findById(lessonId),
      EnrollmentDAO.findByStudentAndCourse(userId, courseId),
      ProgressDAO.findByLesson(userId, lessonId),
    ])

    if (!course) throw new NotFoundError('Course not found')
    if (!lesson) throw new NotFoundError('Lesson not found')
    if (!enrollment) throw new ForbiddenError('You are not enrolled in this course')

    const section = await SectionDAO.findById(lesson.sectionId)
    if (!section || section.courseId.toString() !== courseId.toString()) {
      throw new AppError('Lesson does not belong to this course', 400)
    }

    const completed = input.watchedSeconds >= input.totalSeconds * 0.9
    const progress = await ProgressDAO.upsertProgress({
      studentId: userId,
      lessonId,
      courseId,
      watchedSeconds: input.watchedSeconds,
      totalSeconds: input.totalSeconds,
      completed,
    })

    let progressPercent = enrollment.progressPercent
    const newlyCompleted = completed && !existingProgress?.completed

    if (newlyCompleted) {
      const [completedCount, totalLessons] = await Promise.all([
        ProgressDAO.countCompleted(userId, courseId),
        countLessonsInCourse(courseId),
      ])

      progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      await EnrollmentDAO.updateProgress(userId, courseId, progressPercent, lessonId)
    }

    return {
      watchedSeconds: progress.watchedSeconds,
      totalSeconds: progress.totalSeconds,
      completed: progress.completed,
      progressPercent,
    }
  }

  static async getProgress(userId: mongoose.Types.ObjectId, lessonIdValue: string) {
    const lessonId = toObjectId(lessonIdValue)
    const progress = await ProgressDAO.findByLesson(userId, lessonId)

    return {
      watchedSeconds: progress?.watchedSeconds ?? 0,
      totalSeconds: progress?.totalSeconds ?? 0,
      completed: progress?.completed ?? false,
    }
  }

  static async getCourseProgress(userId: mongoose.Types.ObjectId, courseIdValue: string) {
    const courseId = toObjectId(courseIdValue)
    const enrollment = await EnrollmentDAO.findByStudentAndCourse(userId, courseId)
    if (!enrollment) throw new ForbiddenError('You are not enrolled in this course')

    const progressDocs = await ProgressDAO.findByCourse(userId, courseId)
    return progressDocs.map((progress) => ({
      lessonId: progress.lesson,
      completed: progress.completed,
      watchedSeconds: progress.watchedSeconds,
      totalSeconds: progress.totalSeconds,
      lastWatchedAt: progress.lastWatchedAt,
    }))
  }
}
