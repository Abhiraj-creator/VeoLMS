import mongoose, { Schema, type Document } from 'mongoose'

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Other'
  shortDescription: string
  description: string
  thumbnailUrl: string | null
  thumbnailPublicId: string | null
  price: number
  totalDuration: number
  totalLessons: number
  tags: string[]
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
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Fullstack', 'Other'],
      default: 'Other',
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
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
    thumbnailPublicId: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
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

courseSchema.index({ title: 'text', tags: 'text' })
courseSchema.index({ category: 1, isPublished: 1 })
courseSchema.index({ isPublished: 1, createdAt: -1 })

export const Course = mongoose.model<ICourse>('Course', courseSchema)
