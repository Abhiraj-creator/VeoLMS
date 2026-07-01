import mongoose, { Schema, type Document } from 'mongoose'

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isPublished: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, 'Course slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

courseSchema.index({ isPublished: 1, createdAt: -1 })

export const Course = mongoose.model<ICourse>('Course', courseSchema)
