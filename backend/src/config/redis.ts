import Redis from 'ioredis'
import { config } from './config'

export const redisClient = new Redis(config.REDIS_URL, {
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.warn('⚠️ Redis connection failed after 3 retries — proceeding in dev mode')
      return null
    }
    return Math.min(times * 200, 1000)
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redisClient.on('error', (error) => {
  console.warn('⚠️ Redis notice:', error.message)
})

redisClient.on('close', () => {
  console.log('Redis connection closed')
})

export async function connectRedis(): Promise<void> {
  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect()
    }
  } catch (error: any) {
    console.warn('⚠️ Redis connection failed (running without Redis cache):', error.message)
  }
}

export function getRedisClient(): Redis {
  return redisClient
}

export const redis = redisClient
