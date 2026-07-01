import { Router } from 'express'
import { validate } from '../middleware/validate.middleware'
import { requireAuth } from '../middleware/auth.middleware'
import { authStrictLimit, refreshLimit } from '../middleware/rateLimiter.middleware'
import { asyncHandler } from '../utils/asyncHandler'
import { signupSchema, loginSchema, updateProfileSchema } from '../validators/auth.validators'
import { signup, login, logout, refresh, getMe, updateProfile } from '../controller/auth.controller'

const router:Router = Router()

// POST /api/v1/auth/signup
// router.post('/signup', authStrictLimit, validate(signupSchema), signup)
router.post('/signup', validate(signupSchema), signup)

// POST /api/v1/auth/login
// router.post('/login', authStrictLimit, validate(loginSchema), login)
router.post('/login', validate(loginSchema), login)

// POST /api/v1/auth/logout
router.post('/logout', logout)

// POST /api/v1/auth/refresh
router.post('/refresh', refreshLimit, refresh)

// GET /api/v1/auth/me
router.get('/me', requireAuth, getMe)

// PATCH /api/v1/auth/update-profile
router.patch('/update-profile', asyncHandler(requireAuth), validate(updateProfileSchema), updateProfile)

export default router
