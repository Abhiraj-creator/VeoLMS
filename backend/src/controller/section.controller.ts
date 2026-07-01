import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { CourseService } from '../service/course.service'

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? ''
}

export const createSection: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const section = await CourseService.createSection(req.user!.role, req.body)
  sendSuccess(res, { section }, 'Section created successfully', 201)
})

export const listSections: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const sections = await CourseService.listSections(paramValue(req.params.courseId), req.user?.role === 'admin')
  sendSuccess(res, { sections }, 'Sections retrieved successfully')
})

export const updateSection: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const section = await CourseService.updateSection(req.user!.role, paramValue(req.params.sectionId), req.body)
  sendSuccess(res, { section }, 'Section updated successfully')
})

export const deleteSection: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await CourseService.deleteSection(req.user!.role, paramValue(req.params.sectionId))
  sendSuccess(res, null, 'Section deleted successfully')
})
