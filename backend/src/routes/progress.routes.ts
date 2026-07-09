import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { progressSchema } from '../validators/progress.validators'
import { getCourseProgress, getProgress, saveProgress } from '../controller/progress.controller'

const router: Router = Router()

router.post('/', requireAuth, validate(progressSchema), saveProgress)
router.get('/course/:courseId', requireAuth, getCourseProgress)
router.get('/:lessonId', requireAuth, getProgress)

export default router
