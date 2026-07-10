import mongoose from 'mongoose'
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler.middleware'
import { CourseDAO } from '../Dao/course.dao'
import { SectionDAO } from '../Dao/section.dao'
import { LessonDAO } from '../Dao/lesson.dao'
import { EnrollmentDAO } from '../Dao/enrollment.dao'
import { generateSignedVideoUrl } from '../utils/cloudinary.utils'
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateLessonInput,
  UpdateLessonInput,
} from '../validators/course.validators'

function requireAdmin(role?: 'student' | 'admin'): void {
  if (role !== 'admin') {
    throw new UnauthorizedError('Admin access required')
  }
}

function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid ID', 400)
  }
  return new mongoose.Types.ObjectId(id)
}

export class CourseService {
  static async createCourse(userRole: 'student' | 'admin', userId: mongoose.Types.ObjectId, input: CreateCourseInput) {
    requireAdmin(userRole)
    return CourseDAO.create({ ...input, createdBy: userId })
  }

  static async listCourses(page = 1, limit = 20, includeHidden = false) {
    return CourseDAO.list(page, limit, includeHidden)
  }

  static async getCourse(courseId: string, includeHidden = false) {
    const course = await CourseDAO.findById(courseId)
    if (!course) throw new NotFoundError('Course not found')
    if (!includeHidden && !course.isPublished) throw new NotFoundError('Course not found')
    return course
  }

  static async getCourseDetail(identifier: string, includeHidden = false) {
    const course = mongoose.isValidObjectId(identifier)
      ? await CourseDAO.findById(identifier)
      : await CourseDAO.findBySlug(identifier)

    if (!course) throw new NotFoundError('Course not found')
    if (!includeHidden && !course.isPublished) throw new NotFoundError('Course not found')

    const sections = await SectionDAO.listByCourse(course._id, includeHidden || course.isPublished === false)
    const curriculum = await Promise.all(
      sections.map(async (section) => {
        const lessons = await LessonDAO.listBySection(section._id, includeHidden || section.isPublished === false)
        return {
          _id: section._id,
          courseId: section.courseId,
          title: section.title,
          order: section.order,
          isPublished: section.isPublished,
          lessons: lessons.map((lesson) => ({
            _id: lesson._id,
            sectionId: lesson.sectionId,
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            order: lesson.order,
            isPreview: lesson.isPreview,
            isPublished: lesson.isPublished,
          })),
        }
      })
    )

    return { course, curriculum }
  }

  static async getLessonVideo(
    slug: string,
    lessonIdValue: string,
    user?: { _id: mongoose.Types.ObjectId; role: 'student' | 'admin' }
  ) {
    if (!lessonIdValue) throw new AppError('lessonId query parameter is required', 400)

    const lessonId = toObjectId(lessonIdValue)
    const course = await CourseDAO.findBySlug(slug)
    if (!course || !course.isPublished) throw new NotFoundError('Course not found')

    const lesson = await LessonDAO.findById(lessonId)
    if (!lesson || !lesson.isPublished) throw new NotFoundError('Lesson not found')

    const section = await SectionDAO.findById(lesson.sectionId)
    if (!section || section.courseId.toString() !== course._id.toString() || !section.isPublished) {
      throw new NotFoundError('Lesson not found')
    }

    if (!lesson.isPreview && user?.role !== 'admin') {
      if (!user) throw new UnauthorizedError('Authentication required')
      const enrollment = await EnrollmentDAO.findByStudentAndCourse(user._id, course._id)
      if (!enrollment) throw new ForbiddenError('You are not enrolled in this course')
    }

    const videoUrl = lesson.cloudinaryPublicId
      ? generateSignedVideoUrl(lesson.cloudinaryPublicId)
      : lesson.videoUrl

    if (!videoUrl) throw new NotFoundError('Video not found')

    return {
      videoUrl,
      expiresInSeconds: lesson.cloudinaryPublicId ? 3600 : null,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
      },
    }
  }

  static async updateCourse(userRole: 'student' | 'admin', courseId: string, input: UpdateCourseInput) {
    requireAdmin(userRole)
    const course = await CourseDAO.updateById(courseId, input)
    if (!course) throw new NotFoundError('Course not found')
    return course
  }

  static async deleteCourse(userRole: 'student' | 'admin', courseId: string) {
    requireAdmin(userRole)
    const course = await CourseDAO.deleteById(courseId)
    if (!course) throw new NotFoundError('Course not found')
    return course
  }

  static async createSection(userRole: 'student' | 'admin', input: CreateSectionInput) {
    requireAdmin(userRole)
    const courseId = toObjectId(input.courseId)
    const course = await CourseDAO.findById(courseId)
    if (!course) throw new NotFoundError('Course not found')
    return SectionDAO.create({ ...input, courseId })
  }

  static async listSections(courseId: string, includeHidden = false) {
    const course = await CourseDAO.findById(courseId)
    if (!course) throw new NotFoundError('Course not found')
    return SectionDAO.listByCourse(courseId, includeHidden || course.isPublished === false)
  }

  static async updateSection(userRole: 'student' | 'admin', sectionId: string, input: UpdateSectionInput) {
    requireAdmin(userRole)
    const section = await SectionDAO.updateById(sectionId, input)
    if (!section) throw new NotFoundError('Section not found')
    return section
  }

  static async deleteSection(userRole: 'student' | 'admin', sectionId: string) {
    requireAdmin(userRole)
    const section = await SectionDAO.deleteById(sectionId)
    if (!section) throw new NotFoundError('Section not found')
    return section
  }

  static async createLesson(userRole: 'student' | 'admin', input: CreateLessonInput) {
    requireAdmin(userRole)
    const sectionId = toObjectId(input.sectionId)
    const section = await SectionDAO.findById(sectionId)
    if (!section) throw new NotFoundError('Section not found')
    return LessonDAO.create({ ...input, sectionId })
  }

  static async listLessons(sectionId: string, includeHidden = false) {
    const section = await SectionDAO.findById(sectionId)
    if (!section) throw new NotFoundError('Section not found')
    return LessonDAO.listBySection(sectionId, includeHidden || section.isPublished === false)
  }

  static async updateLesson(userRole: 'student' | 'admin', lessonId: string, input: UpdateLessonInput) {
    requireAdmin(userRole)
    const lesson = await LessonDAO.updateById(lessonId, input)
    if (!lesson) throw new NotFoundError('Lesson not found')
    return lesson
  }

  static async deleteLesson(userRole: 'student' | 'admin', lessonId: string) {
    requireAdmin(userRole)
    const lesson = await LessonDAO.deleteById(lessonId)
    if (!lesson) throw new NotFoundError('Lesson not found')
    return lesson
  }
}
