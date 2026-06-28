import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { getRedisClient } from '../config/redis'

function createStore() {
  return new RedisStore({
    sendCommand: (...args: string[]) => {
      const client = getRedisClient()
      return client.call(args[0]!, ...args.slice(1)) as Promise<number>
    },
  })
}

/** General API: 100 requests per 15 minutes */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Too many requests, please try again later' },
})

/** Auth (login/signup): 5 requests per 15 minutes */
export const authStrictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes' },
  skipSuccessfulRequests: false,
})

/** Token refresh: 20 requests per 15 minutes */
export const refreshLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Too many refresh attempts' },
})

/** File upload: 30 requests per hour */
export const uploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Upload limit reached, please try again later' },
})

/** Payment: 10 requests per hour */
export const paymentLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Payment request limit reached' },
})

/** Search: 30 requests per minute */
export const searchLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { success: false, message: 'Search rate limit exceeded' },
})
