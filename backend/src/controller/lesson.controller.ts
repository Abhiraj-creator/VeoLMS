import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { CourseService } from '../service/course.service'
import { UploadService } from '../service/upload.service'

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}

async function applyLessonVideo(req: Request): Promise<void> {
  if (!req.file) {
    return
  }

  const uploaded = await UploadService.uploadVideo(req.file.buffer, req.file.mimetype)
  req.body.videoUrl = uploaded.url
  req.body.cloudinaryPublicId = uploaded.publicId
}

export const createLesson: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await applyLessonVideo(req)
  const lesson = await CourseService.createLesson(req.user!.role, req.body)
  sendSuccess(res, { lesson }, 'Lesson created successfully', 201)
})

export const listLessons: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const lessons = await CourseService.listLessons(paramValue(req.params.sectionId), req.user?.role === 'admin')
  sendSuccess(res, { lessons }, 'Lessons retrieved successfully')
})

export const updateLesson: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await applyLessonVideo(req)
  const lesson = await CourseService.updateLesson(req.user!.role, paramValue(req.params.lessonId), req.body)
  sendSuccess(res, { lesson }, 'Lesson updated successfully')
})

export const deleteLesson: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await CourseService.deleteLesson(req.user!.role, paramValue(req.params.lessonId))
  sendSuccess(res, null, 'Lesson deleted successfully')
})
