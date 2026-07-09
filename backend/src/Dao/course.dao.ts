import mongoose from 'mongoose'
import { Course, type ICourse } from '../models/course.model'
import { Lesson } from '../models/lesson.model'
import { Section } from '../models/section.model'

export class CourseDAO {
  static create(data: {
    title: string
    slug: string
    category?: 'Frontend' | 'Backend' | 'Fullstack' | 'Other'
    shortDescription?: string
    description: string
    thumbnailUrl?: string | null
    thumbnailPublicId?: string | null
    price?: number
    totalDuration?: number
    totalLessons?: number
    tags?: string[]
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
    data: Partial<Pick<ICourse, 'title' | 'slug' | 'category' | 'shortDescription' | 'description' | 'thumbnailUrl' | 'thumbnailPublicId' | 'price' | 'totalDuration' | 'totalLessons' | 'tags' | 'isPublished'>>
  ): Promise<ICourse | null> {
    return Course.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec()
  }

  static async updateCache(courseId: string | mongoose.Types.ObjectId): Promise<ICourse | null> {
    const sections = await Section.find({ courseId }).select('_id').exec()
    const sectionIds = sections.map((section) => section._id)
    const [stats] = await Lesson.aggregate<{ totalLessons: number; totalDuration: number }>([
      { $match: { sectionId: { $in: sectionIds } } },
      {
        $group: {
          _id: null,
          totalLessons: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
    ])

    return Course.findByIdAndUpdate(
      courseId,
      {
        $set: {
          totalLessons: stats?.totalLessons ?? 0,
          totalDuration: stats?.totalDuration ?? 0,
        },
      },
      { returnDocument: 'after', runValidators: true }
    ).exec()
  }

  static deleteById(id: string | mongoose.Types.ObjectId): Promise<ICourse | null> {
    return Course.findByIdAndDelete(id).exec()
  }
}
