import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createLessonSchema,
  updateLessonSchema,
} from '../validators/course.validators'
import {
  createLesson,
  listLessons,
  updateLesson,
  deleteLesson,
} from '../controller/lesson.controller'

const router: import('express').Router = Router()

router.get('/section/:sectionId', requireAuth, listLessons)
router.post('/', requireAuth, validate(createLessonSchema), createLesson)
router.patch('/:lessonId', requireAuth, validate(updateLessonSchema), updateLesson)
router.delete('/:lessonId', requireAuth, deleteLesson)

export default router
