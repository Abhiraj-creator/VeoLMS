import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'

interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

interface VerifyPaymentResponse {
  enrollment: unknown
  courseSlug?: string
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, { courseId: string }>({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
      transformResponse: (response: APIResponse<{ order: CreateOrderResponse }>) => response.data!.order,
      invalidatesTags: ['Enrollment'],
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, {
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    }>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response: APIResponse<VerifyPaymentResponse>) => response.data!,
      invalidatesTags: ['Enrollment'],
    }),
  }),
})

export const { useCreateOrderMutation, useVerifyPaymentMutation } = paymentApi
