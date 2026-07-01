import streamifier from 'streamifier'
import { cloudinary } from '../config/cloudinary'

export interface CloudinaryUploadOptions {
  folder: string
  resourceType: 'image' | 'video'
}

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  format?: string
  bytes?: number
  duration?: number
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          duration: typeof result.duration === 'number' ? result.duration : undefined,
        })
      }
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}
