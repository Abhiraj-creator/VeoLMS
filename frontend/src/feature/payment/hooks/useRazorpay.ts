import { useCallback, useState } from 'react'
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../api/payment.api'
import { useToast } from '../../../shared/components/ui/Toast'
import type { ICourse } from '../../../types/course.types'

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal: {
    ondismiss: () => void
  }
  prefill?: {
    name?: string
    email?: string
  }
}

interface RazorpayInstance {
  open: () => void
}

let razorpayScriptPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve()
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay="true"]')
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')), {
          once: true,
        })
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.dataset.razorpay = 'true'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay'))
      document.body.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

function getRazorpayError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const message = (error as { data?: { message?: string } }).data?.message
    if (message) return message
  }

  return 'Payment failed. Please try again.'
}

export function useRazorpay() {
  const [createOrder] = useCreateOrderMutation()
  const [verifyPayment] = useVerifyPaymentMutation()
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const startPayment = useCallback(
    async (course: ICourse, firstLessonId: string) => {
      setIsProcessing(true)

      try {
        await loadRazorpayScript()
        const order = await createOrder({ courseId: course._id }).unwrap()

        const RazorpayCtor = window.Razorpay
        if (!RazorpayCtor) {
          throw new Error('Razorpay is unavailable')
        }

        const instance = new RazorpayCtor({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'VeoLMS',
          description: course.title,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }).unwrap()

              window.location.assign(`/learn/${course.slug}/${firstLessonId}`)
            } catch (verifyError) {
              toast.error('Payment verification failed', getRazorpayError(verifyError))
            }
          },
          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled')
            },
          },
        })

        instance.open()
      } catch (error) {
        toast.error('Unable to start payment', getRazorpayError(error))
      } finally {
        setIsProcessing(false)
      }
    },
    [createOrder, toast, verifyPayment]
  )

  return { startPayment, isProcessing }
}
