import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { AdminService } from '../service/admin.service'

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}

export const getStats: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminService.getStats()
  sendSuccess(res, { stats }, 'Admin stats retrieved successfully')
})

export const getAnalytics: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await AdminService.getAnalytics()
  sendSuccess(res, { analytics }, 'Admin analytics retrieved successfully')
})

export const getAllStudents: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q : ''
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  const { users, total } = await AdminService.getAllStudents(query, page, limit)
  sendSuccess(res, { students: users, total, page, limit }, 'Students retrieved successfully')
})

export const getStudentEnrollments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await AdminService.getStudentEnrollments(paramValue(req.params.id))
  sendSuccess(res, { enrollments }, 'Student enrollments retrieved successfully')
})
