import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { uploadLimit } from '../middleware/rateLimiter.middleware'
import { imageUpload, videoUpload } from '../middleware/upload.middleware'
import { uploadImage, uploadVideo } from '../controller/upload.controller'

const router: Router = Router()

router.post('/video', requireAuth, requireRole('admin'), uploadLimit, videoUpload, uploadVideo)
router.post('/image', requireAuth, requireRole('admin'), uploadLimit, imageUpload, uploadImage)

export default router
