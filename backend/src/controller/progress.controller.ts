import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { ProgressService } from '../service/progress.service'

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}

export const saveProgress: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const progress = await ProgressService.saveProgress(req.user!._id, req.body)
  sendSuccess(res, { progress }, 'Progress saved successfully')
})

export const getProgress: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const progress = await ProgressService.getProgress(req.user!._id, paramValue(req.params.lessonId))
  sendSuccess(res, { progress }, 'Progress retrieved successfully')
})

export const getCourseProgress: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const progress = await ProgressService.getCourseProgress(req.user!._id, paramValue(req.params.courseId))
  sendSuccess(res, { progress }, 'Course progress retrieved successfully')
})
