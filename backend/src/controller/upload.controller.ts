import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { UploadService } from '../service/upload.service'
import { AppError } from '../middleware/errorHandler.middleware'

export const uploadVideo: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file provided', 400)
  }

  const video = await UploadService.uploadVideo(req.file.buffer, req.file.mimetype)
  sendSuccess(res, { video }, 'Video uploaded successfully', 200)
})

export const uploadImage: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file provided', 400)
  }

  const image = await UploadService.uploadImage(req.file.buffer, req.file.mimetype)
  sendSuccess(res, { image }, 'Image uploaded successfully', 200)
})
