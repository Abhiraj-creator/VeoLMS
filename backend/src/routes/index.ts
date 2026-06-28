import { Router,type RouterOptions } from 'express'
import authRouter from './auth.routes'

const router:Router = Router()

// Routes will be mounted here as phases are implemented:
router.use('/auth', authRouter)
// router.use('/courses', courseRouter)
// router.use('/sections', sectionRouter)
// router.use('/lessons', lessonRouter)
// router.use('/upload', uploadRouter)
// router.use('/payments', paymentRouter)
// router.use('/enrollments', enrollmentRouter)
// router.use('/progress', progressRouter)
// router.use('/admin', adminRouter)

export default router
