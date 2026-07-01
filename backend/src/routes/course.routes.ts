import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createCourseSchema,
  updateCourseSchema,
} from '../validators/course.validators'
import {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../controller/course.controller'

const router:Router = Router()

router.get('/', requireAuth, listCourses)
router.get('/:courseId', requireAuth, getCourse)
router.post('/', requireAuth, validate(createCourseSchema), createCourse)
router.patch('/:courseId', requireAuth, validate(updateCourseSchema), updateCourse)
router.delete('/:courseId', requireAuth, deleteCourse)

export default router
