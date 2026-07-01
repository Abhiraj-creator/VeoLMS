import { AppError } from '../middleware/errorHandler.middleware'
import { uploadBufferToCloudinary } from '../utils/cloudinary.utils'

export interface VideoUploadResult {
  url: string
  publicId: string
  duration?: number
  format?: string
  bytes?: number
}

export interface ImageUploadResult {
  url: string
  publicId: string
}

export class UploadService {
  static async uploadVideo(fileBuffer: Buffer, _mimetype: string): Promise<VideoUploadResult> {
    if (!fileBuffer) {
      throw new AppError('No file provided', 400)
    }

    const result = await uploadBufferToCloudinary(fileBuffer, {
      folder: 'veolms/lessons',
      resourceType: 'video',
    })

    return {
      url: result.url,
      publicId: result.publicId,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
    }
  }

  static async uploadImage(fileBuffer: Buffer, _mimetype: string): Promise<ImageUploadResult> {
    if (!fileBuffer) {
      throw new AppError('No file provided', 400)
    }

    const result = await uploadBufferToCloudinary(fileBuffer, {
      folder: 'veolms/thumbnails',
      resourceType: 'image',
    })

    return {
      url: result.url,
      publicId: result.publicId,
    }
  }
}
