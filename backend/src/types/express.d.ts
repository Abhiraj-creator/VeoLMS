import mongoose from 'mongoose'
import { Buffer } from 'buffer'

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }
      user?: {
        _id: mongoose.Types.ObjectId
        role: 'student' | 'admin'
      }
      rawBody?: Buffer
    }
  }
}

export { }
