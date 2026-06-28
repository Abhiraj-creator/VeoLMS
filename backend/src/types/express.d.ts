import mongoose from 'mongoose'
import { Buffer } from 'buffer'

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: mongoose.Types.ObjectId
        role: 'student' | 'admin'
      }
      rawBody?: Buffer
    }
  }
}

export { }
