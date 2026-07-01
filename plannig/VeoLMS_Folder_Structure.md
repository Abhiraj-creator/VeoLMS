# VeoLMS — Complete Folder Structure
**Step 4 of 10 | Production-Ready | Feature-Based Frontend + Layered Backend**

---

## Architecture Philosophy

### Frontend — 4-Layer Feature Architecture
Each feature is self-contained and owns all 4 layers:
```
Feature
 ├── api/        Layer 1 — RTK Query API slice (server communication)
 ├── state/      Layer 2 — Redux slice (local/cached state)
 ├── hooks/      Layer 3 — Custom hooks (business logic, derived state)
 └── components/ Layer 4 — UI components (pure rendering)
```
Pages just compose feature components. Shared/ holds truly cross-feature code.
This means you can delete a feature folder and nothing else breaks.

### Backend — Layered MVC (not strict MVC)
```
Request → Router → Middleware → Controller → Service → DAO → Model → DB
                                    ↓
                               Validator (Zod)
                                    ↓
                             Error → GlobalHandler
```
- **Router:** URL mapping only
- **Controller:** Parse req/res, call service, return response
- **Service:** Business logic, orchestration
- **DAO (Data Access Object):** All DB queries live here — service never touches Mongoose directly
- **Model:** Schema definition only
- **Middleware:** Cross-cutting concerns (auth, rate limit, upload, etc.)
- **Validator:** Zod schemas — called by controller before service

Why DAO layer? Separates DB logic from business logic.
If you swap MongoDB for PostgreSQL, only DAOs change, services stay the same.
This is the answer to "how would you scale this?" in your interview.

---

## Frontend Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── og-image.png                    # Open Graph image for social sharing
│   └── robots.txt
│
├── src/
│   │
│   ├── app/                            # App-level setup (runs once)
│   │   ├── App.tsx                     # Root component, providers wrapper
│   │   ├── app.routes.tsx              # All route definitions (React Router v6)
│   │   └── app.store.ts                # Redux store configuration
│   │
│   ├── providers/                      # React context providers
│   │   ├── ThemeProvider.tsx           # Dark/light mode context + localStorage
│   │   ├── AuthProvider.tsx            # Rehydrates auth state on app load (calls /auth/me)
│   │   └── index.tsx                   # Wraps all providers in correct order
│   │
│   ├── pages/                          # Route-level page components (thin — just compose)
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CoursesPage.tsx         # Listing + search + filter
│   │   │   ├── CourseDetailPage.tsx    # /courses/:slug
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── student/
│   │   │   ├── DashboardPage.tsx       # /dashboard
│   │   │   └── LearnPage.tsx           # /learn/:slug/:lessonId
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx  # /admin
│   │       ├── AdminCoursesPage.tsx    # /admin/courses
│   │       ├── AdminCourseFormPage.tsx # /admin/courses/new + /admin/courses/:id/edit
│   │       ├── AdminStudentsPage.tsx   # /admin/students
│   │       ├── AdminEnrollmentsPage.tsx
│   │       └── AdminAnalyticsPage.tsx
│   │
│   ├── features/                       # Feature modules (the core of the app)
│   │   │
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts         # RTK Query endpoints: signup, login, logout, me
│   │   │   ├── state/
│   │   │   │   └── auth.slice.ts       # Redux slice: user, accessToken, isAuthenticated
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts          # Reads auth state from Redux
│   │   │   │   └── useAuthForm.ts      # Form state + submit handlers for login/signup
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       ├── SignupForm.tsx
│   │   │       └── AuthGuard.tsx       # HOC/wrapper — redirects if not authenticated
│   │   │
│   │   ├── courses/
│   │   │   ├── api/
│   │   │   │   └── courses.api.ts      # RTK Query: getCourses, getCourseBySlug, admin CRUD
│   │   │   ├── state/
│   │   │   │   └── courses.slice.ts    # Active filters, search query, selected course
│   │   │   ├── hooks/
│   │   │   │   ├── useCourses.ts       # Fetches + filters course list
│   │   │   │   ├── useCourseDetail.ts  # Single course with curriculum
│   │   │   │   └── useCourseForm.ts    # Admin create/edit form logic
│   │   │   └── components/
│   │   │       ├── CourseCard.tsx      # Used on homepage + listing page
│   │   │       ├── CourseGrid.tsx      # Responsive grid of CourseCards
│   │   │       ├── CourseHero.tsx      # Course detail page top section
│   │   │       ├── CourseCurriculum.tsx # Accordion sections → lessons list
│   │   │       ├── CourseSearchBar.tsx
│   │   │       ├── CourseCategoryFilter.tsx
│   │   │       └── CourseCardSkeleton.tsx  # Loading placeholder
│   │   │
│   │   ├── learn/
│   │   │   ├── api/
│   │   │   │   ├── video.api.ts        # getSignedVideoUrl (lesson/:id/video)
│   │   │   │   └── progress.api.ts     # saveProgress, getProgress, getCourseProgress
│   │   │   ├── state/
│   │   │   │   └── learn.slice.ts      # currentLesson, sidebarOpen, playbackState
│   │   │   ├── hooks/
│   │   │   │   ├── useVideoPlayer.ts   # Plyr init, event listeners, signed URL fetch
│   │   │   │   ├── useProgressTracker.ts # 30s interval, pause/end listeners, upsert call
│   │   │   │   └── useLearnNavigation.ts # Next/prev lesson, sidebar state
│   │   │   └── components/
│   │   │       ├── VideoPlayer.tsx     # Plyr wrapper component
│   │   │       ├── LessonSidebar.tsx   # Course curriculum nav with completion marks
│   │   │       ├── LessonSidebarItem.tsx
│   │   │       └── LearnLayout.tsx     # Full-page layout: sidebar + player
│   │   │
│   │   ├── payment/
│   │   │   ├── api/
│   │   │   │   └── payment.api.ts      # createOrder, verifyPayment
│   │   │   ├── state/
│   │   │   │   └── payment.slice.ts    # paymentStatus: idle/pending/success/failed
│   │   │   ├── hooks/
│   │   │   │   └── useRazorpay.ts      # Loads Razorpay script, opens modal, handles cb
│   │   │   └── components/
│   │   │       ├── EnrollButton.tsx    # CTA on course page — triggers payment flow
│   │   │       └── PaymentStatusModal.tsx # Success/failure overlay
│   │   │
│   │   ├── dashboard/
│   │   │   ├── api/
│   │   │   │   └── dashboard.api.ts    # getMyEnrollments, getRecentProgress
│   │   │   ├── state/
│   │   │   │   └── dashboard.slice.ts
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   └── components/
│   │   │       ├── EnrolledCourseCard.tsx  # Card with progress bar
│   │   │       ├── ContinueLearning.tsx    # "Resume" widget
│   │   │       ├── ProgressOverview.tsx
│   │   │       └── RecentlyWatched.tsx
│   │   │
│   │   └── admin/
│   │       ├── api/
│   │       │   └── admin.api.ts        # stats, students, analytics, course CRUD
│   │       ├── state/
│   │       │   └── admin.slice.ts
│   │       ├── hooks/
│   │       │   ├── useAdminStats.ts
│   │       │   ├── useAdminStudents.ts
│   │       │   └── useAdminAnalytics.ts
│   │       └── components/
│   │           ├── AdminSidebar.tsx
│   │           ├── StatsCard.tsx
│   │           ├── RecentEnrollmentsTable.tsx
│   │           ├── RevenueChart.tsx        # Recharts bar chart
│   │           ├── EnrollmentTimelineChart.tsx  # Recharts line chart
│   │           ├── CourseTable.tsx         # Admin course list with actions
│   │           ├── StudentTable.tsx
│   │           ├── CourseFormStep1.tsx     # Details form (TipTap + fields)
│   │           ├── CourseFormStep2.tsx     # Curriculum builder (sections + lessons)
│   │           ├── SectionBuilder.tsx      # Drag-to-reorder sections
│   │           ├── LessonBuilder.tsx       # Lesson form within section
│   │           └── VideoUploader.tsx       # File picker → POST /upload/video
│   │
│   ├── shared/                             # Truly cross-feature code
│   │   ├── components/
│   │   │   ├── ui/                         # Base design system components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx              # Top navigation bar
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx             # Base sidebar (admin extends this)
│   │   │   │   └── PageWrapper.tsx         # Max-width container + padding
│   │   │   └── guards/
│   │   │       ├── ProtectedRoute.tsx      # Redirects to /login if not authenticated
│   │   │       └── AdminRoute.tsx          # Redirects to / if not admin
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts              # Debounce search input
│   │   │   ├── useLocalStorage.ts          # Persist theme preference
│   │   │   ├── useIntersectionObserver.ts  # Lazy loading / infinite scroll prep
│   │   │   └── useWindowSize.ts            # Responsive breakpoint detection
│   │   ├── libs/
│   │   │   ├── axios.ts                    # Axios instance with interceptors (token refresh)
│   │   │   └── tiptap.ts                   # TipTap editor config (extensions)
│   │   └── state/
│   │       └── baseApi.ts                  # RTK Query base (baseUrl, prepareHeaders)
│   │
│   ├── types/                              # Global TypeScript interfaces
│   │   ├── user.types.ts
│   │   ├── course.types.ts
│   │   ├── enrollment.types.ts
│   │   ├── progress.types.ts
│   │   └── api.types.ts                    # APIResponse<T>, PaginatedResponse<T>
│   │
│   ├── constants/                          # App-wide constants (never magic strings)
│   │   ├── routes.ts                       # ROUTES.HOME = '/', ROUTES.DASHBOARD etc.
│   │   ├── api.ts                          # API_BASE_URL, endpoints map
│   │   └── app.ts                          # APP_NAME, PAGINATION defaults etc.
│   │
│   ├── utils/                              # Pure utility functions
│   │   ├── formatDuration.ts               # 3600 → "1h 0m"
│   │   ├── formatPrice.ts                  # 999 → "₹999"
│   │   ├── formatDate.ts                   # ISO → "Jan 12, 2026"
│   │   ├── generateSlug.ts                 # "My Course" → "my-course"
│   │   └── cn.ts                           # clsx + tailwind-merge helper
│   │
│   └── main.tsx                            # Entry point — renders <App /> in providers
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── .env                                    # VITE_API_BASE_URL etc.
├── .env.example                            # Committed — template without secrets
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## Backend Structure

```
backend/
├── src/
│   │
│   ├── config/                             # External service configuration
│   │   ├── database.ts                     # Mongoose connect + disconnect
│   │   ├── redis.ts                        # Upstash Redis client (ioredis)
│   │   ├── cloudinary.ts                   # Cloudinary SDK init
│   │   ├── razorpay.ts                     # Razorpay SDK init
│   │   └── config.ts                       # Env variable validation + export
│   │                                       # (throws on startup if required vars missing)
│   │
│   ├── models/                             # Mongoose schema definitions ONLY
│   │   ├── user.model.ts
│   │   ├── course.model.ts
│   │   ├── section.model.ts
│   │   ├── lesson.model.ts
│   │   ├── enrollment.model.ts
│   │   ├── progress.model.ts
│   │   └── review.model.ts
│   │
│   ├── dao/                                # Data Access Objects — ALL DB queries here
│   │   │                                   # Services NEVER import Mongoose directly
│   │   ├── user.dao.ts                     # findByEmail, findById, create, update
│   │   ├── course.dao.ts                   # findBySlug, findAll (with filters), create...
│   │   ├── section.dao.ts
│   │   ├── lesson.dao.ts                   # findWithVideoUrl (select: +videoUrl)
│   │   ├── enrollment.dao.ts               # findByStudentAndCourse, upsert, analytics
│   │   ├── progress.dao.ts                 # upsertProgress, findByStudentAndLesson
│   │   └── review.dao.ts
│   │
│   ├── services/                           # Business logic — orchestrates DAOs
│   │   ├── auth.service.ts                 # signup, login, logout, refresh token logic
│   │   ├── course.service.ts               # create, update, delete (cascade), publish
│   │   ├── section.service.ts
│   │   ├── lesson.service.ts               # create lesson + update course cache
│   │   ├── upload.service.ts               # Stream to Cloudinary, return metadata
│   │   ├── payment.service.ts              # createOrder, verifySignature, handleWebhook
│   │   ├── enrollment.service.ts           # getMyEnrollments, getRecent
│   │   ├── progress.service.ts             # saveProgress + update enrollment cache
│   │   └── admin.service.ts                # stats aggregation, analytics pipelines
│   │
│   ├── controllers/                        # HTTP layer — parse req, call service, return res
│   │   ├── auth.controller.ts
│   │   ├── course.controller.ts
│   │   ├── section.controller.ts
│   │   ├── lesson.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── enrollment.controller.ts
│   │   ├── progress.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── routes/                             # Express Router — URL mapping only
│   │   ├── auth.routes.ts
│   │   ├── course.routes.ts
│   │   ├── section.routes.ts
│   │   ├── lesson.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── payment.routes.ts              # ⚠ webhook route uses express.raw()
│   │   ├── enrollment.routes.ts
│   │   ├── progress.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts                       # Mounts all routers on /api/v1
│   │
│   ├── middleware/                         # Express middleware (cross-cutting)
│   │   ├── auth.middleware.ts              # requireAuth, requireRole, optionalAuth
│   │   ├── rateLimiter.middleware.ts       # All rate limit configs (general, auth_strict...)
│   │   ├── upload.middleware.ts            # Multer config (memoryStorage, file type check)
│   │   ├── validate.middleware.ts          # Zod validation runner
│   │   ├── sanitize.middleware.ts          # express-mongo-sanitize wrapper
│   │   └── errorHandler.middleware.ts      # Global error handler + AppError classes
│   │
│   ├── validators/                         # Zod schemas (one file per domain)
│   │   ├── auth.validators.ts
│   │   ├── course.validators.ts
│   │   ├── section.validators.ts
│   │   ├── lesson.validators.ts
│   │   ├── progress.validators.ts
│   │   └── payment.validators.ts
│   │
│   ├── utils/                              # Pure utility functions
│   │   ├── jwt.utils.ts                    # signAccessToken, signRefreshToken, verifyToken
│   │   ├── redis.utils.ts                  # blacklistToken, isBlacklisted
│   │   ├── cloudinary.utils.ts             # generateSignedUrl, deleteAsset
│   │   ├── slugify.utils.ts                # title → slug + uniqueness check
│   │   ├── asyncHandler.ts                 # Wraps async controllers (no try/catch needed)
│   │   └── apiResponse.ts                  # successResponse(), errorResponse() helpers
│   │
│   ├── types/                              # TypeScript interfaces (shared across layers)
│   │   ├── express.d.ts                    # Extends Express Request with req.user
│   │   ├── auth.types.ts                   # JWTPayload, AuthRequest
│   │   ├── course.types.ts
│   │   └── common.types.ts                 # PaginatedResult<T>, APIResponse<T>
│   │
│   ├── constants/                          # Server-side constants
│   │   ├── roles.ts                        # USER_ROLES = { STUDENT, ADMIN }
│   │   ├── limits.ts                       # RATE_LIMITS, UPLOAD_LIMITS
│   │   └── messages.ts                     # AUTH_MESSAGES.INVALID_CREDENTIALS etc.
│   │
│   ├── jobs/                               # Background / scheduled tasks
│   │   └── cleanupPendingEnrollments.ts    # Cron: mark old 'pending' enrollments as 'failed'
│   │                                       # (Razorpay orders expire in 15 min)
│   │
│   ├── seeds/                              # Database seeding
│   │   ├── index.ts                        # Master seed runner
│   │   ├── users.seed.ts                   # Admin + student accounts
│   │   ├── courses.seed.ts                 # 5 courses with sections + lessons
│   │   └── data/
│   │       └── courses.data.ts             # Static seed data (titles, descriptions, URLs)
│   │
│   └── app.ts                              # Express app setup (middleware stack, routes)
│
├── server.ts                               # Entry point: connects DB + starts HTTP server
├── tsconfig.json
├── .env
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── nodemon.json                            # Dev server config (watch src/, exec ts-node)
└── package.json
```

---

## Key File Contents (Stubs)

### `src/app.ts` — Middleware order matters
```typescript
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import { corsOptions } from './config/config'
import { generalRateLimit } from './middleware/rateLimiter.middleware'
import { globalErrorHandler } from './middleware/errorHandler.middleware'
import { apiRouter } from './routes/index'

const app = express()

// Security headers first
app.use(helmet(helmetOptions))
app.use(cors(corsOptions))

// ⚠ Webhook route needs raw body — mount BEFORE express.json()
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))

// Body parsing for all other routes
app.use(express.json({ limit: '10kb' }))   // Limit body size — prevents payload attacks
app.use(express.urlencoded({ extended: true }))

// Sanitize after parsing
app.use(mongoSanitize())

// Global rate limit
app.use(generalRateLimit)

// Routes
app.use('/api/v1', apiRouter)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler — must be last
app.use(globalErrorHandler)

export default app
```

### `server.ts` — Startup sequence
```typescript
import app from './src/app'
import { connectDatabase } from './src/config/database'
import { connectRedis } from './src/config/redis'
import { validateEnv } from './src/config/config'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    validateEnv()           // Throws if required env vars missing
    await connectDatabase() // MongoDB Atlas
    await connectRedis()    // Upstash Redis
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
```

### `src/config/config.ts` — Env validation
```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  ADMIN_SECRET_KEY: z.string().min(8),
  CLIENT_URL: z.string().url(),
})

export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)  // Hard fail — don't start with missing config
  }
  return result.data
}

export const config = validateEnv()
```

### `src/utils/asyncHandler.ts` — Eliminates try/catch in controllers
```typescript
import { Request, Response, NextFunction } from 'express'

// Wraps async route handlers — errors auto-forwarded to globalErrorHandler
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Usage in controller:
// router.get('/me', requireAuth, asyncHandler(AuthController.getMe))
// No try/catch needed in the controller function
```

### `src/utils/apiResponse.ts`
```typescript
import { Response } from 'express'

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => res.status(statusCode).json({ success: true, message, data })

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Fetched successfully'
) => res.status(200).json({
  success: true,
  message,
  data: {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
})
```

### `src/types/express.d.ts` — Extend Express Request
```typescript
import { Types } from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId
        role: 'student' | 'admin'
      }
    }
  }
}
```
This lets you use `req.user._id` in any controller without TypeScript errors.

### Example DAO pattern — `src/dao/enrollment.dao.ts`
```typescript
import { Enrollment, IEnrollment } from '../models/enrollment.model'
import { Types } from 'mongoose'

export const EnrollmentDAO = {
  // Used by payment service and video access middleware
  findByStudentAndCourse: (studentId: Types.ObjectId, courseId: Types.ObjectId) =>
    Enrollment.findOne({ student: studentId, course: courseId, status: 'completed' }),

  // Idempotent upsert — safe to call multiple times
  upsertCompleted: (razorpayOrderId: string, paymentId: string) =>
    Enrollment.findOneAndUpdate(
      { razorpayOrderId },
      { $set: { razorpayPaymentId: paymentId, status: 'completed', enrolledAt: new Date() } },
      { new: true }
    ),

  findMyEnrollments: (studentId: Types.ObjectId) =>
    Enrollment.find({ student: studentId, status: 'completed' })
      .populate('course', 'title slug thumbnail totalLessons totalDuration category')
      .populate('lastWatchedLesson', 'title _id')
      .sort({ enrolledAt: -1 }),
}
```

Services call `EnrollmentDAO.findByStudentAndCourse(...)` — never `Enrollment.findOne(...)` directly.

---

## Route Guard Implementation

### `src/shared/components/guards/ProtectedRoute.tsx`
```typescript
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { ROUTES } from '../../constants/routes'

interface Props {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />  // Don't flash redirect during rehydration

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

### `src/shared/components/guards/AdminRoute.tsx`
```typescript
export const AdminRoute = ({ children }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />  // Authenticated but wrong role
  }

  return <>{children}</>
}
```

---

## `src/app/app.routes.tsx` — Route structure
```typescript
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../shared/components/guards/ProtectedRoute'
import { AdminRoute } from '../shared/components/guards/AdminRoute'

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <HomePage /> },
  { path: '/courses', element: <CoursesPage /> },
  { path: '/courses/:slug', element: <CourseDetailPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  // Student routes (authenticated)
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
  },
  {
    path: '/learn/:slug/:lessonId',
    element: <ProtectedRoute><LearnPage /></ProtectedRoute>
  },

  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute><AdminDashboardPage /></AdminRoute>
  },
  {
    path: '/admin/courses',
    element: <AdminRoute><AdminCoursesPage /></AdminRoute>
  },
  {
    path: '/admin/courses/new',
    element: <AdminRoute><AdminCourseFormPage /></AdminRoute>
  },
  {
    path: '/admin/courses/:id/edit',
    element: <AdminRoute><AdminCourseFormPage /></AdminRoute>
  },
  {
    path: '/admin/students',
    element: <AdminRoute><AdminStudentsPage /></AdminRoute>
  },
  {
    path: '/admin/analytics',
    element: <AdminRoute><AdminAnalyticsPage /></AdminRoute>
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
])
```

---

## `src/constants/routes.ts`
```typescript
// Never use raw strings in <Link to="/dashboard"> — use these constants
export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  LEARN: (slug: string, lessonId: string) => `/learn/${slug}/${lessonId}`,
  ADMIN: '/admin',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_COURSE_NEW: '/admin/courses/new',
  ADMIN_COURSE_EDIT: (id: string) => `/admin/courses/${id}/edit`,
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const
```

---

## Package Dependencies

### Frontend `package.json` (key deps)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.24.0",
    "@reduxjs/toolkit": "^2.2.0",
    "react-redux": "^9.1.0",
    "axios": "^1.7.0",
    "plyr": "^3.7.8",
    "@tiptap/react": "^2.4.0",
    "@tiptap/starter-kit": "^2.4.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.2.0",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "dompurify": "^3.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.3.0",
    "@types/dompurify": "^3.0.0"
  }
}
```

### Backend `package.json` (key deps)
```json
{
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.4.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "ioredis": "^5.4.0",
    "zod": "^3.23.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.3.0",
    "rate-limit-redis": "^4.2.0",
    "express-mongo-sanitize": "^2.2.0",
    "multer": "^1.4.5",
    "cloudinary": "^2.3.0",
    "streamifier": "^0.1.1",
    "razorpay": "^2.9.0",
    "slugify": "^1.6.6",
    "dompurify": "^3.1.0",
    "jsdom": "^24.1.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.1.0",
    "@types/express": "^4.17.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/multer": "^1.4.0",
    "@types/cors": "^2.8.0",
    "@types/node-cron": "^3.0.0"
  },
  "scripts": {
    "dev": "nodemon server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "ts-node src/seeds/index.ts"
  }
}
```

---

## What Was Added vs Your Screenshots

| Area | Your Screenshot | Added |
|---|---|---|
| Frontend guards | ❌ Missing | `ProtectedRoute` + `AdminRoute` in shared/guards |
| Frontend constants | ❌ Missing | `routes.ts`, `api.ts`, `app.ts` in constants/ |
| Frontend utils | ❌ Missing | `formatDuration`, `formatPrice`, `cn.ts` etc. |
| Frontend providers | ❌ Missing | `ThemeProvider`, `AuthProvider` in providers/ |
| Frontend types/ | ❌ Missing | Global TS interfaces for all models |
| Frontend shared/libs | ❌ Missing | `axios.ts` (interceptors), `tiptap.ts` |
| Frontend payment feature | ❌ Missing | Full `useRazorpay.ts` + `EnrollButton` |
| Backend DAO layer | ❌ Missing | Full DAO pattern separating DB from service |
| Backend validators/ | ❌ Missing | Zod schemas in own folder |
| Backend config validation | ❌ Missing | `config.ts` with `validateEnv()` |
| Backend jobs/ | ❌ Missing | Cron for expired pending enrollments |
| Backend seeds/ | ❌ Missing | Complete seed runner |
| Backend utils/ | ❌ Missing | `asyncHandler`, `apiResponse`, `jwt.utils` |
| Backend types/express.d.ts | ❌ Missing | req.user type extension |
| Webhook raw body setup | ❌ Missing | Correct `app.ts` middleware order |

---

*Step 4 complete. Both structures are production-ready.*
*Next: Step 5 — Authentication & Authorization Architecture*
