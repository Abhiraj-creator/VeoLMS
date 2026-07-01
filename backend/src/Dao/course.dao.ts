import mongoose from 'mongoose'
import { Course, type ICourse } from '../models/course.model'

export class CourseDAO {
  static create(data: {
    title: string
    slug: string
    description: string
    thumbnailUrl?: string | null
    isPublished?: boolean
    createdBy: mongoose.Types.ObjectId
  }): Promise<ICourse> {
    return Course.create(data)
  }

  static findById(id: string | mongoose.Types.ObjectId): Promise<ICourse | null> {
    return Course.findById(id).exec()
  }

  static findBySlug(slug: string): Promise<ICourse | null> {
    return Course.findOne({ slug }).exec()
  }

  static async list(page: number = 1, limit: number = 20, includeHidden = false): Promise<{ courses: ICourse[]; total: number }> {
    const filter = includeHidden ? {} : { isPublished: true }
    const skip = (page - 1) * limit
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Course.countDocuments(filter).exec(),
    ])
    return { courses, total }
  }

  static updateById(
    id: string | mongoose.Types.ObjectId,
    data: Partial<Pick<ICourse, 'title' | 'slug' | 'description' | 'thumbnailUrl' | 'isPublished'>>
  ): Promise<ICourse | null> {
    return Course.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec()
  }

  static deleteById(id: string | mongoose.Types.ObjectId): Promise<ICourse | null> {
    return Course.findByIdAndDelete(id).exec()
  }
}
