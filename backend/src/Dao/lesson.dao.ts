import mongoose from 'mongoose'
import { Lesson, type ILesson } from '../models/lesson.model'

export class LessonDAO {
  static create(data: {
    sectionId: mongoose.Types.ObjectId
    title: string
    content: string
    videoUrl?: string | null
    cloudinaryPublicId?: string | null
    duration?: number
    order: number
    isPreview?: boolean
    isPublished?: boolean
  }): Promise<ILesson> {
    return Lesson.create(data)
  }

  static findById(id: string | mongoose.Types.ObjectId): Promise<ILesson | null> {
    return Lesson.findById(id).exec()
  }

  static listBySection(sectionId: string | mongoose.Types.ObjectId, includeHidden = false): Promise<ILesson[]> {
    const filter = {
      sectionId,
      ...(includeHidden ? {} : { isPublished: true }),
    }
    return Lesson.find(filter).sort({ order: 1 }).exec()
  }

  static countBySection(sectionId: string | mongoose.Types.ObjectId): Promise<number> {
    return Lesson.countDocuments({ sectionId }).exec()
  }

  static updateById(
    id: string | mongoose.Types.ObjectId,
    data: Partial<Pick<ILesson, 'title' | 'content' | 'videoUrl' | 'cloudinaryPublicId' | 'duration' | 'order' | 'isPreview' | 'isPublished'>>
  ): Promise<ILesson | null> {
    return Lesson.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec()
  }

  static deleteById(id: string | mongoose.Types.ObjectId): Promise<ILesson | null> {
    return Lesson.findByIdAndDelete(id).exec()
  }
}
