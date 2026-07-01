import mongoose, { Schema, type Document } from 'mongoose'

export interface ISection extends Document {
  _id: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  title: string
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const sectionSchema = new Schema<ISection>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
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

sectionSchema.index({ courseId: 1, order: 1 }, { unique: true })

export const Section = mongoose.model<ISection>('Section', sectionSchema)
