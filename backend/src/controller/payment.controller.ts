import type { Request, Response, RequestHandler } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { PaymentService } from '../service/payment.service'

export const createOrder: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await PaymentService.createOrder(req.user!._id, req.body)
  sendSuccess(res, { order }, 'Payment order created successfully', 201)
})

export const verifyPayment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.verifyPayment(req.user!._id, req.body)
  sendSuccess(res, result, 'Payment verified successfully')
})

export const webhook: RequestHandler = async (_req: Request, res: Response) => {
  const req = _req
  const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(JSON.stringify(req.body ?? {}))
  const signature = req.headers['x-razorpay-signature']

  await PaymentService.handleWebhook(rawBody, Array.isArray(signature) ? signature[0] : signature)
  res.status(200).json({ received: true })
}
