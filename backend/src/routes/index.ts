import { Router } from 'express'
import authRouter from './auth.routes'
import courseRouter from './course.routes'
import sectionRouter from './section.routes'
import lessonRouter from './lesson.routes'
import uploadRouter from './upload.routes'
import paymentRouter from './payment.routes'
import enrollmentRouter from './enrollment.routes'
import progressRouter from './progress.routes'

const router:Router = Router()

router.use('/auth', authRouter)
router.use('/courses', courseRouter)
router.use('/sections', sectionRouter)
router.use('/lessons', lessonRouter)
router.use('/upload', uploadRouter)
router.use('/payments', paymentRouter)
router.use('/enrollments', enrollmentRouter)
router.use('/progress', progressRouter)
// router.use('/admin', adminRouter)

export default router
