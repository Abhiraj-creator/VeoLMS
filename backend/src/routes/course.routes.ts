import { Router } from 'express'
import { optionalAuth, requireAuth } from '../middleware/auth.middleware'
import { imageUpload } from '../middleware/upload.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createCourseSchema,
  updateCourseSchema,
} from '../validators/course.validators'
import {
  createCourse,
  listCourses,
  getCourse,
  getCourseVideo,
  updateCourse,
  deleteCourse,
} from '../controller/course.controller'

const router:Router = Router()

router.get('/', optionalAuth, listCourses)
router.get('/:courseId/video', optionalAuth, getCourseVideo)
router.get('/:courseId', optionalAuth, getCourse)
router.post('/', requireAuth, imageUpload, validate(createCourseSchema), createCourse)
router.patch('/:courseId', requireAuth, imageUpload, validate(updateCourseSchema), updateCourse)
router.delete('/:courseId', requireAuth, deleteCourse)

export default router
