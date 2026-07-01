import mongoose from 'mongoose'
import { Section, type ISection } from '../models/section.model'

export class SectionDAO {
  static create(data: {
    courseId: mongoose.Types.ObjectId
    title: string
    order: number
    isPublished?: boolean
  }): Promise<ISection> {
    return Section.create(data)
  }

  static findById(id: string | mongoose.Types.ObjectId): Promise<ISection | null> {
    return Section.findById(id).exec()
  }

  static listByCourse(courseId: string | mongoose.Types.ObjectId, includeHidden = false): Promise<ISection[]> {
    const filter = {
      courseId,
      ...(includeHidden ? {} : { isPublished: true }),
    }
    return Section.find(filter).sort({ order: 1 }).exec()
  }

  static updateById(
    id: string | mongoose.Types.ObjectId,
    data: Partial<Pick<ISection, 'title' | 'order' | 'isPublished'>>
  ): Promise<ISection | null> {
    return Section.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec()
  }

  static deleteById(id: string | mongoose.Types.ObjectId): Promise<ISection | null> {
    return Section.findByIdAndDelete(id).exec()
  }
}
