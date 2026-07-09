import mongoose from 'mongoose'
import { EnrollmentDAO } from '../Dao/enrollment.dao'
import { ProgressDAO } from '../Dao/progress.dao'

export class EnrollmentService {
  static getMyEnrollments(userId: mongoose.Types.ObjectId) {
    return EnrollmentDAO.findMyEnrollments(userId)
  }

  static getRecentProgress(userId: mongoose.Types.ObjectId) {
    return ProgressDAO.findRecentByStudent(userId)
  }

  static getAllEnrollments(page = 1, limit = 20) {
    return EnrollmentDAO.findAllEnrollments({}, page, limit)
  }
}
