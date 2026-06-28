import express, { Request, Response, NextFunction,type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import mongoose from 'mongoose'
import { config } from './config/config'
import { getRedisClient } from './config/redis'
import { globalErrorHandler, NotFoundError } from './middleware/errorHandler.middleware'
import { generalRateLimit } from './middleware/rateLimiter.middleware'
import router from './routes/index'
import authRouter from './routes/auth.routes'

const app:Express = express()

// ─────────────────────────────────────────────
// 1. Security headers (Helmet)
// ─────────────────────────────────────────────
app.use(helmet())

// ─────────────────────────────────────────────
// 2. CORS
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─────────────────────────────────────────────
// 2.5. Cookie parser
// ─────────────────────────────────────────────
app.use(cookieParser())

// ─────────────────────────────────────────────
// 3. Raw body capture for webhook — MUST come before express.json()
// ─────────────────────────────────────────────
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req: Request, _res: Response, next: NextFunction) => {
    req.rawBody = req.body as Buffer
    next()
  }
)

// ─────────────────────────────────────────────
// 4. Body parsing (after webhook raw capture)
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─────────────────────────────────────────────
// 5. NoSQL injection prevention
// ─────────────────────────────────────────────
// express-mongo-sanitize is incompatible with Express 5 out of the box because req.query is a getter.
// We redefine it as a normal writable property first to avoid the TypeError.
app.use((req, _res, next) => {
  Object.defineProperty(req, 'query', {
    value: req.query,
    configurable: true,
    writable: true,
    enumerable: true,
  })
  next()
})
app.use(mongoSanitize())

// ─────────────────────────────────────────────
// 6. General rate limiting
// ─────────────────────────────────────────────
app.use(generalRateLimit)

// ─────────────────────────────────────────────
// 7. Health check route
// ─────────────────────────────────────────────
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  let redisStatus = 'disconnected'
  try {
    const redisClient = getRedisClient()
    await redisClient.ping()
    redisStatus = 'connected'
  } catch {
    redisStatus = 'disconnected'
  }

  res.status(200).json({
    status: 'ok',
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  })
})

// ─────────────────────────────────────────────
// 8. API routes
// ─────────────────────────────────────────────
app.use('/api/v1', router)

// ─────────────────────────────────────────────
// 9. 404 handler
// ─────────────────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'))
})

// ─────────────────────────────────────────────
// 10. Global error handler (MUST be last)
// ─────────────────────────────────────────────
app.use(globalErrorHandler)

export default app