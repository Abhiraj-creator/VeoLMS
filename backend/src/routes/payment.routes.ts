import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { paymentLimit } from '../middleware/rateLimiter.middleware'
import { validate } from '../middleware/validate.middleware'
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validators'
import { createOrder, verifyPayment, webhook } from '../controller/payment.controller'

const router: Router = Router()

router.post('/create-order', requireAuth, paymentLimit, validate(createOrderSchema), createOrder)
router.post('/verify', requireAuth, validate(verifyPaymentSchema), verifyPayment)
router.post('/webhook', webhook)

export default router
