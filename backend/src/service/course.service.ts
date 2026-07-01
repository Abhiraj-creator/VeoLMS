import mongoose from 'mongoose'
import { AppError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler.middleware'
import { CourseDAO } from '../Dao/course.dao'
import { SectionDAO } from '../Dao/section.dao'
import { LessonDAO } from '../Dao/lesson.dao'
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
