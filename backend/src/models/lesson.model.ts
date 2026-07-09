import mongoose, { Schema, type Document } from 'mongoose'

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId
  sectionId: mongoose.Types.ObjectId
  title: string
  content: string
  videoUrl: string | null
  cloudinaryPublicId: string | null
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const lessonSchema = new Schema<ILesson>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
      trim: true,
      minlength: 1,
      maxlength: 10000,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

lessonSchema.index({ sectionId: 1, order: 1 }, { unique: true })

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema)
