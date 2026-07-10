import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { CourseService } from '../service/course.service'
import { UploadService } from '../service/upload.service'

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}

async function applyCourseThumbnail(req: Request): Promise<void> {
  if (!req.file) {
    return
  }

  const uploaded = await UploadService.uploadImage(req.file.buffer, req.file.mimetype)
  req.body.thumbnailUrl = uploaded.url
  req.body.thumbnailPublicId = uploaded.publicId
}

export const createCourse: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await applyCourseThumbnail(req)
  const course = await CourseService.createCourse(req.user!.role, req.user!._id, req.body)
  sendSuccess(res, { course }, 'Course created successfully', 201)
})

export const listCourses: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  const includeHidden = req.user?.role === 'admin'
  const { courses, total } = await CourseService.listCourses(page, limit, includeHidden)
  sendSuccess(res, { courses, total, page, limit }, 'Courses retrieved successfully')
})

export const getCourse: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await CourseService.getCourseDetail(paramValue(req.params.courseId), req.user?.role === 'admin')
  sendSuccess(res, result, 'Course retrieved successfully')
})

export const getCourseVideo: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const video = await CourseService.getLessonVideo(
    paramValue(req.params.courseId),
    typeof req.query.lessonId === 'string' ? req.query.lessonId : '',
    req.user
  )
  sendSuccess(res, video, 'Lesson video retrieved successfully')
})

export const updateCourse: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await applyCourseThumbnail(req)
  const course = await CourseService.updateCourse(req.user!.role, paramValue(req.params.courseId), req.body)
  sendSuccess(res, { course }, 'Course updated successfully')
})

export const deleteCourse: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await CourseService.deleteCourse(req.user!.role, paramValue(req.params.courseId))
  sendSuccess(res, null, 'Course deleted successfully')
})
