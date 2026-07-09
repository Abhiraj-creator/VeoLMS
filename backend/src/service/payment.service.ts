import crypto from 'crypto'
import mongoose from 'mongoose'
import { razorpay } from '../config/razorpay'
import { config } from '../config/config'
import { CourseDAO } from '../Dao/course.dao'
import { EnrollmentDAO } from '../Dao/enrollment.dao'
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler.middleware'
import type { CreateOrderInput, VerifyPaymentInput } from '../validators/payment.validators'

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
}

function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid ID', 400)
  }
  return new mongoose.Types.ObjectId(id)
}

function createHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

export class PaymentService {
  static async createOrder(userId: mongoose.Types.ObjectId, input: CreateOrderInput) {
    const courseId = toObjectId(input.courseId)
    const course = await CourseDAO.findById(courseId)

    if (!course || !course.isPublished) {
      throw new NotFoundError('Course not found')
    }

    if (course.price <= 0) {
      throw new AppError('This course does not require payment', 400)
    }

    const existingEnrollment = await EnrollmentDAO.findAnyByStudentAndCourse(userId, courseId)
    if (existingEnrollment?.status === 'completed') {
      throw new ConflictError('Already enrolled in this course')
    }
    if (existingEnrollment?.status === 'pending') {
      throw new ConflictError('Payment already initiated for this course')
    }

    const amountInPaise = Math.round(course.price * 100)
    const createRazorpayOrder = razorpay.orders.create as unknown as (options: {
      amount: number
      currency: string
      receipt: string
      notes: Record<string, string>
    }) => Promise<RazorpayOrder>

    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    })

    await EnrollmentDAO.create({
      student: userId,
      course: courseId,
      razorpayOrderId: order.id,
      amount: course.price,
      status: 'pending',
    })

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.RAZORPAY_KEY_ID,
    }
  }

  static async verifyPayment(userId: mongoose.Types.ObjectId, input: VerifyPaymentInput) {
    const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
    const expectedSignature = createHmacSignature(payload, config.RAZORPAY_KEY_SECRET)

    if (!signaturesMatch(expectedSignature, input.razorpaySignature)) {
      throw new AppError('Invalid payment signature', 400)
    }

    const enrollment = await EnrollmentDAO.findByOrderId(input.razorpayOrderId)
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found')
    }
    if (enrollment.student.toString() !== userId.toString()) {
      throw new UnauthorizedError('This payment does not belong to the authenticated user')
    }

    const completedEnrollment = await EnrollmentDAO.upsertCompleted(input.razorpayOrderId, input.razorpayPaymentId)
    if (!completedEnrollment) {
      throw new NotFoundError('Enrollment not found')
    }

    const course = completedEnrollment.course as unknown as { slug?: string; title?: string }
    return {
      enrollment: completedEnrollment,
      courseSlug: course.slug,
    }
  }

  static async handleWebhook(rawBody: Buffer, signature?: string) {
    if (!signature) {
      return { received: true }
    }

    const expectedSignature = createHmacSignature(rawBody.toString(), config.RAZORPAY_WEBHOOK_SECRET)
    if (!signaturesMatch(expectedSignature, signature)) {
      return { received: true }
    }

    try {
      const event = JSON.parse(rawBody.toString()) as {
        event?: string
        payload?: {
          payment?: {
            entity?: {
              id?: string
              order_id?: string
            }
          }
        }
      }

      if (event.event === 'payment.captured') {
        const payment = event.payload?.payment?.entity
        if (payment?.order_id && payment.id) {
          await EnrollmentDAO.upsertCompleted(payment.order_id, payment.id)
        }
      }
    } catch {
      return { received: true }
    }

    return { received: true }
  }
}
