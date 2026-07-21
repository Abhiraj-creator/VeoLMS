import mongoose from 'mongoose'
import { Course } from '../models/course.model'
import { Enrollment } from '../models/enrollment.model'
import { UserDAO } from '../Dao/user.dao'
import { AppError } from '../middleware/errorHandler.middleware'

function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid ID', 400)
  }
  return new mongoose.Types.ObjectId(id)
}

export class AdminService {
  static async getStats() {
    const [totalCourses, totalStudents, enrollmentStats, recentEnrollments] = await Promise.all([
      Course.countDocuments().exec(),
      UserDAO.countStudents(),
      Enrollment.aggregate<{ count: number; revenue: number }>([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
      ]),
      Enrollment.find({ status: 'completed' })
        .sort({ enrolledAt: -1 })
        .limit(5)
        .populate('student', 'name email')
        .populate('course', 'title slug thumbnailUrl')
        .exec(),
    ])

    return {
      totalCourses,
      totalStudents,
      totalEnrollments: enrollmentStats[0]?.count ?? 0,
      totalRevenue: enrollmentStats[0]?.revenue ?? 0,
      recentEnrollments,
    }
  }

  static async getAnalytics() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [revenuePerCourse, enrollmentsByDay] = await Promise.all([
      Enrollment.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$course',
            revenue: { $sum: '$amount' },
            enrollments: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: '$course' },
        {
          $project: {
            _id: 0,
            courseId: '$_id',
            title: '$course.title',
            slug: '$course.slug',
            revenue: 1,
            enrollments: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Enrollment.aggregate([
        { $match: { status: 'completed', enrolledAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' } },
            enrollments: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            enrollments: 1,
            revenue: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
    ])

    return { revenuePerCourse, enrollmentsByDay }
  }

  static async getAllStudents(query = '', page = 1, limit = 20) {
    const { users, total } = await UserDAO.findAllStudents(query, page, limit)
    const studentIds = users.map((user) => user._id)

    const enrollmentCounts =
      studentIds.length === 0
        ? []
        : await Enrollment.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
            { $match: { student: { $in: studentIds }, status: 'completed' } },
            { $group: { _id: '$student', count: { $sum: 1 } } },
          ])

    const countByStudent = new Map(
      enrollmentCounts.map((entry) => [entry._id.toString(), entry.count])
    )

    const usersWithEnrollmentCount = users.map((user) => ({
      ...(typeof user.toObject === 'function' ? user.toObject() : user),
      enrollmentCount: countByStudent.get(user._id.toString()) ?? 0,
    }))

    return { users: usersWithEnrollmentCount, total }
  }

  static getStudentEnrollments(studentId: string) {
    return Enrollment.find({ student: toObjectId(studentId) })
      .populate('course', 'title slug thumbnailUrl price')
      .populate('lastWatchedLesson', 'title order')
      .sort({ enrolledAt: -1 })
      .exec()
  }
}
