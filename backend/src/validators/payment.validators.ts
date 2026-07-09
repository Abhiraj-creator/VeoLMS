import mongoose from 'mongoose'
import { z } from 'zod'

const objectIdSchema = z.string().refine((value) => mongoose.isValidObjectId(value), {
  message: 'Invalid ObjectId',
})

export const createOrderSchema = z.object({
  courseId: objectIdSchema,
})

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
