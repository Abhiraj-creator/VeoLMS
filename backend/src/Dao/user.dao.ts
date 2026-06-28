import mongoose from 'mongoose'
import  FilterQuery,{type QueryFilter}  from 'mongoose'
import { User, IUser } from '../models/user.model'

export class UserDAO {
  static async findByEmail(
    email: string,
    includePassword = false
  ): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() })
    if (includePassword) {
      query.select('+passwordHash')
    }
    return query.exec()
  }

  static async findById(id: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return User.findById(id).exec()
  }

  static async create(data: {
    name: string
    email: string
    passwordHash: string
    role?: 'student' | 'admin'
  }): Promise<IUser> {
    const user = new User(data)
    return user.save()
  }

  static async updateById(
    id: string | mongoose.Types.ObjectId,
    data: Partial<Pick<IUser, 'name' | 'avatar' | 'isActive'>>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec()
  }

  static async findAllStudents(
    query: string = '',
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: IUser[]; total: number }> {
    const filter: FilterQuery<IUser> = { role: 'student', isActive: true }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ])

    return { users, total }
  }

  static async countStudents(): Promise<number> {
    return User.countDocuments({ role: 'student' }).exec()
  }
}
