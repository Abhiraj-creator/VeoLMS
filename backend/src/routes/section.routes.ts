import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createSectionSchema,
  updateSectionSchema,
} from '../validators/course.validators'
import {
  createSection,
  listSections,
  updateSection,
  deleteSection,
} from '../controller/section.controller'

const router: import('express').Router = Router()

router.get('/course/:courseId', requireAuth, listSections)
router.post('/', requireAuth, validate(createSectionSchema), createSection)
router.patch('/:sectionId', requireAuth, validate(updateSectionSchema), updateSection)
router.delete('/:sectionId', requireAuth, deleteSection)

export default router
