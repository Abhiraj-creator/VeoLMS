import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { EnrollmentService } from '../service/enrollment.service'

export const getMyEnrollments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await EnrollmentService.getMyEnrollments(req.user!._id)
  sendSuccess(res, { enrollments }, 'Enrollments retrieved successfully')
})

export const getRecentProgress: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const recentProgress = await EnrollmentService.getRecentProgress(req.user!._id)
  sendSuccess(res, { recentProgress }, 'Recent progress retrieved successfully')
})

export const getAllEnrollments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  const { enrollments, total } = await EnrollmentService.getAllEnrollments(page, limit)
  sendSuccess(res, { enrollments, total, page, limit }, 'All enrollments retrieved successfully')
})
