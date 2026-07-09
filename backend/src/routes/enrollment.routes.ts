import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { getAllEnrollments, getMyEnrollments, getRecentProgress } from '../controller/enrollment.controller'

const router: Router = Router()

router.get('/my', requireAuth, getMyEnrollments)
router.get('/my/recent', requireAuth, getRecentProgress)
router.get('/', requireAuth, requireRole('admin'), getAllEnrollments)

export default router
