import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { getAllStudents, getAnalytics, getStats, getStudentEnrollments } from '../controller/admin.controller'

const router: Router = Router()

router.get('/stats', requireAuth, requireRole('admin'), getStats)
router.get('/students', requireAuth, requireRole('admin'), getAllStudents)
router.get('/students/:id/enrollments', requireAuth, requireRole('admin'), getStudentEnrollments)
router.get('/analytics', requireAuth, requireRole('admin'), getAnalytics)

export default router
