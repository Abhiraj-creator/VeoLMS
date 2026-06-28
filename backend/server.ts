import dotenv from 'dotenv'
dotenv.config()

import { validateEnv } from './src/config/config'
import { connectDatabase, disconnectDatabase } from './src/config/database'
import { connectRedis, getRedisClient } from './src/config/redis'
import app from './src/app'

async function startServer(): Promise<void> {
  // Step 1: Validate all environment variables
  const config = validateEnv()

  // Step 2: Connect to MongoDB
  await connectDatabase()

  // Step 3: Connect to Redis
  await connectRedis()

  // Step 4: Start HTTP server
  const port = parseInt(config.PORT, 10)
  const server = app.listen(port, () => {
    console.log(`🚀 VeoLMS Backend running on http://localhost:${port}`)
    console.log(`   Environment: ${config.NODE_ENV}`)
    console.log(`   Health check: http://localhost:${port}/api/v1/health`)
  })

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(async () => {
      await disconnectDatabase()
      try {
        const redis = getRedisClient()
        await redis.quit()
      } catch {
        // Redis may already be closed
      }
      console.log('Server closed')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Promise Rejection:', reason)
    process.exit(1)
  })
}

startServer().catch((error: unknown) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})
