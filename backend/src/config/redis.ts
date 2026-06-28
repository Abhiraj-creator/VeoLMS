import Redis from 'ioredis'
import { config } from './config'

export const redisClient = new Redis(config.REDIS_URL, {
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries — exiting')
      process.exit(1)
    }
    return Math.min(times * 200, 1000)
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redisClient.on('error', (error) => {
  console.error('❌ Redis error:', error.message)
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
    if (error.message !== 'Redis is already connecting/connected') {
      throw error
    }
  }
}

export function getRedisClient(): Redis {
  return redisClient
}

export const redis = redisClient
