import mongoose, { Schema, type Document } from 'mongoose'

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  watchedSeconds: number
  totalSeconds: number
  completed: boolean
  lastWatchedAt: Date
  updatedAt: Date
}

const progressSchema = new Schema<IProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    watchedSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

progressSchema.index({ student: 1, lesson: 1 }, { unique: true })
progressSchema.index({ student: 1, course: 1 })
progressSchema.index({ lesson: 1, completed: 1 })

export const Progress = mongoose.model<IProgress>('Progress', progressSchema)
