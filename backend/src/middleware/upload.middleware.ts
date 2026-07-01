import multer from 'multer'
import type { Request, RequestHandler } from 'express'
import { AppError } from './errorHandler.middleware'

const memoryStorage = multer.memoryStorage()

function fileFilter(
  allowedMimeTypes: string[],
  typeLabel: string
): multer.Options['fileFilter'] {
  return (_req: Request, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new AppError(`Invalid ${typeLabel} file type`, 400))
      return
    }
    cb(null, true)
  }
}

function createUploader(
  allowedMimeTypes: string[],
  typeLabel: string,
  maxSizeMb: number
) : RequestHandler {
  return multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
    },
    fileFilter: fileFilter(allowedMimeTypes, typeLabel),
  }).single(typeLabel) as RequestHandler
}

export const videoUpload: RequestHandler = createUploader(
  ['video/mp4', 'video/webm', 'video/quicktime'],
  'video',
  500
)

export const imageUpload: RequestHandler = createUploader(
  ['image/jpeg', 'image/png', 'image/webp'],
  'image',
  5
)
