# VeoLMS — Phased Development Script
**Step 5 of the Build Process | Your Actual Coding Playbook**

---

## How To Use This Document

Each phase has 4 sections:
1. **What you're building** — scope, no ambiguity
2. **Exact AI prompt** — paste this into Antigravity/Codex verbatim
3. **What to review** — what to read and understand before moving on
4. **Verification checklist** — manual tests to confirm the phase works

**Rules:**
- Do NOT start a new phase until the checklist of the current phase is 100% green
- After AI writes code, read every file before running it
- If something fails the checklist, fix it before moving on — do not patch it later
- Backend phases come before frontend phases that depend on them

---

## Phase Map

```
Phase 1  →  Project Bootstrap (both repos)
Phase 2  →  Backend: Config, DB, Redis, App Setup
Phase 3  →  Backend: User Model + Auth (signup/login/logout/refresh)
Phase 4  →  Backend: Course + Section + Lesson Models + Admin CRUD APIs
Phase 5  →  Backend: Upload (Cloudinary video + image)
Phase 6  →  Backend: Payment (Razorpay create-order + verify + webhook)
Phase 7  →  Backend: Enrollment + Progress APIs
Phase 8  →  Backend: Admin Stats + Analytics APIs
Phase 9  →  Backend: Seed Script + Full API Test
Phase 10 →  Frontend: Bootstrap + Redux + Axios + Routing
Phase 11 →  Frontend: Auth UI (Login, Signup, Guards, Token Refresh)
Phase 12 →  Frontend: Public Homepage + Course Listing
Phase 13 →  Frontend: Course Detail Page + Enrollment Flow
Phase 14 →  Frontend: Learn Page (Video Player + Progress Tracking)
Phase 15 →  Frontend: Student Dashboard
Phase 16 →  Frontend: Admin Dashboard + Course Management
Phase 17 →  Frontend: Admin Curriculum Builder (Sections + Lessons + Upload)
Phase 18 →  Frontend: Admin Analytics + Student Management
Phase 19 →  Polish (Dark/Light Theme, Skeletons, Error States, Mobile)
Phase 20 →  Deployment (Render + Vercel + MongoDB Atlas + Upstash)
```

---

## PHASE 1 — Project Bootstrap

**What you're building:** Initialize both repos with correct configs. No logic yet.

### AI Prompt (run this in both repos separately)

**For backend:**
```
I'm building VeoLMS — a full-stack LMS. Set up the backend project with:

Tech: Node.js + Express + TypeScript
Package manager: pnpm
Entry point: server.ts (root level)
Source: src/

Create:
- tsconfig.json with strict: true, rootDir: src, outDir: dist, esModuleInterop: true, resolveJsonModule: true
- nodemon.json watching src/**/*.ts, executing ts-node server.ts
- .eslintrc.json with TypeScript rules
- .prettierrc with singleQuote: true, semi: false, tabWidth: 2
- .env.example with ALL required keys:
    NODE_ENV, PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
    REDIS_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
    ADMIN_SECRET_KEY, CLIENT_URL
- .gitignore (node_modules, dist, .env, *.log)
- package.json with scripts: dev, build, start, seed
- Install dependencies:
    express mongoose bcryptjs jsonwebtoken ioredis zod helmet cors
    express-rate-limit rate-limit-redis express-mongo-sanitize
    multer cloudinary streamifier razorpay slugify dompurify jsdom node-cron
- Install devDependencies:
    typescript ts-node nodemon @types/express @types/node @types/jsonwebtoken
    @types/bcryptjs @types/multer @types/cors @types/node-cron eslint prettier

Create a minimal server.ts that just logs "Server starting..." and exits.
Do NOT write any business logic yet.
```

**For frontend:**
```
I'm building VeoLMS — a full-stack LMS. Set up the frontend project with:

Tech: React 18 + TypeScript + Vite
Package manager: pnpm
Command: pnpm create vite@latest . (already done, clean the template)

Install dependencies:
  react-router-dom @reduxjs/toolkit react-redux axios
  plyr @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
  recharts framer-motion lucide-react clsx tailwind-merge dompurify
  @types/dompurify

Install devDependencies:
  tailwindcss autoprefixer postcss @tailwindcss/typography @tailwindcss/forms

Create:
- tailwind.config.ts with content: ["./index.html","./src/**/*.{ts,tsx}"]
  Add custom colors: dark background #0A0A0A, surface #111111,
  accent orange-500 (#F97316), text-secondary zinc-400
  Add fontFamily: sans: ['Inter', 'sans-serif']
- postcss.config.js
- .env.example with VITE_API_BASE_URL=
- .gitignore
- src/index.css importing Tailwind base, components, utilities
  Add @import url Google Fonts for Inter

Clean App.tsx to return just <div>VeoLMS</div>
Do NOT write any components yet.
```

### What To Review
- Read `tsconfig.json` — understand `strict: true` implications
- Read `tailwind.config.ts` — know your color token names (you'll type them 500 times)
- Confirm `.env.example` has every key you need

### Verification Checklist
- [ ] `pnpm dev` in backend starts without TypeScript errors
- [ ] `pnpm dev` in frontend opens `http://localhost:5173` with "VeoLMS" text
- [ ] No `node_modules` or `.env` in git (`git status` shows clean after adding to .gitignore)
- [ ] `pnpm build` succeeds in both repos

---

## PHASE 2 — Backend: Config, DB, Redis, App Setup

**What you're building:** The entire Express app skeleton — middleware stack, config validation, DB connection, Redis connection. No routes yet.

### AI Prompt
```
I'm building VeoLMS backend (Express + TypeScript + MongoDB + Redis).

Folder structure reference:
src/config/, src/middleware/, src/utils/, src/types/

Create these files:

1. src/config/config.ts
   - Use Zod to validate ALL env variables on startup
   - Export a `config` object with typed values
   - Export `validateEnv()` that calls process.exit(1) if validation fails
   - Variables: NODE_ENV, PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
     REDIS_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
     RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
     ADMIN_SECRET_KEY, CLIENT_URL

2. src/config/database.ts
   - connectDatabase(): connects Mongoose, logs success
   - disconnectDatabase(): for graceful shutdown
   - Handle connection errors with process.exit(1)

3. src/config/redis.ts
   - Create ioredis client using REDIS_URL from config
   - Export connected client
   - Handle connection errors (log + exit)

4. src/config/cloudinary.ts
   - Initialize cloudinary v2 SDK with env credentials
   - Export configured cloudinary instance

5. src/config/razorpay.ts
   - Initialize Razorpay SDK
   - Export instance

6. src/types/express.d.ts
   - Extend Express Request interface with:
     user?: { _id: mongoose.Types.ObjectId; role: 'student' | 'admin' }

7. src/types/common.types.ts
   - PaginatedResult<T> interface
   - APIResponse<T> interface

8. src/utils/asyncHandler.ts
   - Wrap async Express handlers so errors auto-forward to next()
   - No try/catch needed in controllers

9. src/utils/apiResponse.ts
   - sendSuccess(res, data, message?, statusCode?)
   - sendPaginated(res, items, total, page, limit, message?)

10. src/utils/jwt.utils.ts
    - signAccessToken(userId, role): signs 15min JWT
    - signRefreshToken(userId): signs 7day JWT
    - verifyToken(token, secret): returns JWTPayload or throws

11. src/middleware/errorHandler.middleware.ts
    - AppError base class (message, statusCode, errors?)
    - NotFoundError (404), ForbiddenError (403), UnauthorizedError (401),
      ConflictError (409), ValidationError (400 with field errors array)
    - globalErrorHandler Express error middleware:
      handles Mongoose ValidationError, duplicate key (11000),
      JWT errors, AppError subclasses, unknown errors
      Never leak stack traces in production

12. src/middleware/rateLimiter.middleware.ts
    - Use express-rate-limit with RedisStore
    - Export: generalRateLimit (100/15min), authStrictLimit (5/15min),
      refreshLimit (20/15min), uploadLimit (30/hr), paymentLimit (10/hr),
      searchLimit (30/1min)

13. src/app.ts
    - Mount middleware in this EXACT order:
      helmet → cors → raw body for /api/v1/payments/webhook →
      express.json (limit 10kb) → express.urlencoded → mongoSanitize →
      generalRateLimit → /api/v1 routes → 404 handler → globalErrorHandler
    - CORS: credentials: true, allow CLIENT_URL + localhost:5173
    - Add /api/v1/health route inline that checks DB + Redis status
    - Import routes from src/routes/index.ts (create empty file for now)

14. src/routes/index.ts
    - Empty router for now, will be populated in later phases

15. server.ts (root)
    - Call validateEnv → connectDatabase → connectRedis → app.listen
    - Log startup errors and exit(1) on failure
    - Handle SIGTERM for graceful shutdown

Important constraints:
- Use config.* (not process.env.*) everywhere after config.ts
- All async functions wrapped in asyncHandler or explicit try/catch
- No business logic in this phase
```

### What To Review
- Read `errorHandler.middleware.ts` entirely — you will use these error classes in every controller
- Read `app.ts` middleware order — understand WHY webhook comes before `express.json()`
- Read `jwt.utils.ts` — understand what's in the payload and why

### Verification Checklist
- [ ] `pnpm dev` starts, logs "Database connected" and "Redis connected"
- [ ] `GET http://localhost:5000/api/v1/health` returns `{ status: "ok", services: { database: "connected", redis: "connected" } }`
- [ ] Start server with a missing env var (e.g. delete MONGODB_URI) — it should crash with a clear error message, not a cryptic mongoose error
- [ ] `GET http://localhost:5000/nonexistent` returns `{ success: false, message: "Route not found" }`

---

## PHASE 3 — Backend: Auth System

**What you're building:** User model + signup/login/logout/refresh/me — the complete auth system with JWT + Redis blacklist.

### AI Prompt
```
I'm building VeoLMS auth system. Context from previous phases:
- asyncHandler, AppError classes, sendSuccess, jwt.utils, redis client all exist
- Express Request has req.user?: { _id: ObjectId, role: string }

Build the complete auth system:

1. src/models/user.model.ts
   - Fields: name, email, passwordHash (select:false), role (student|admin),
     avatar (String, default null), isActive (Boolean, default true)
   - Timestamps: true
   - pre('save') hook: hash passwordHash with bcrypt saltRounds 12, only if modified
   - Instance method: comparePassword(candidate): Promise<boolean>
   - Indexes: email (unique), role, createdAt desc

2. src/validators/auth.validators.ts
   - signupSchema: name(2-50), email(valid), password(8+ chars, 1 upper, 1 number, 1 special), adminKey(optional)
   - loginSchema: email, password(min 1)
   - updateProfileSchema: name(optional), avatar(url, optional)

3. src/middleware/validate.middleware.ts
   - validate(schema: ZodSchema) middleware factory
   - Parses req.body through schema, attaches cleaned data to req.body
   - On error: throws ValidationError with field-level messages

4. src/middleware/auth.middleware.ts
   - requireAuth: extracts Bearer token → checks Redis blacklist →
     verifies JWT → attaches req.user → calls next()
     Throws UnauthorizedError on any failure
   - requireRole(role): checks req.user.role, throws ForbiddenError if mismatch
   - optionalAuth: same as requireAuth but calls next() even without token

5. src/dao/user.dao.ts
   - findByEmail(email, includePassword?: boolean)
     — if includePassword: .select('+passwordHash')
   - findById(id)
   - create(data): creates new user
   - updateById(id, data): returns updated user
   - findAllStudents(query, page, limit)
   - countStudents()

6. src/services/auth.service.ts
   - signup(name, email, password, adminKey?)
     → check email uniqueness → hash password → create user → sign tokens → return
   - login(email, password)
     → findByEmail with password → comparePassword → sign tokens → return
     → SAME error message for "not found" vs "wrong password" (anti-enumeration)
   - logout(accessToken)
     → decode token → get remaining TTL → redis.setex('bl_'+token, ttl, '1')
   - refreshToken(refreshToken from cookie)
     → verify → check blacklist → find user → sign new access token
   - getMe(userId): returns user without passwordHash
   - updateProfile(userId, data)

   Token cookie settings:
   - httpOnly: true, secure: NODE_ENV === 'production',
     sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000

7. src/controllers/auth.controller.ts
   - signup, login, logout, refresh, getMe, updateProfile
   - Each: parse validated req.body → call service → sendSuccess or set cookie
   - login: set refresh token cookie AND return access token in body
   - logout: clearCookie('refreshToken')

8. src/routes/auth.routes.ts
   - POST /signup — [authStrictLimit, validate(signupSchema), asyncHandler(signup)]
   - POST /login — [authStrictLimit, validate(loginSchema), asyncHandler(login)]
   - POST /logout — [requireAuth, asyncHandler(logout)]
   - POST /refresh — [refreshLimit, asyncHandler(refresh)]
   - GET /me — [requireAuth, asyncHandler(getMe)]
   - PATCH /update-profile — [requireAuth, asyncHandler(updateProfile)]

9. Update src/routes/index.ts to mount auth routes at /auth

Security constraints:
- passwordHash NEVER appears in any response
- Token blacklist key format: 'bl_' + token (prevents key collision)
- Use crypto.timingSafeEqual for any signature comparison
- Rate limits: authStrictLimit on signup + login
```

### What To Review
- Read `auth.service.ts` — trace the full signup flow line by line
- Read `auth.middleware.ts` — understand the blacklist check order
- Understand why `optionalAuth` is needed (course detail page — shows enrollment status if logged in)

### Verification Checklist (use Postman or Thunder Client)
- [ ] `POST /api/v1/auth/signup` with valid data → 201, returns accessToken + user (no passwordHash)
- [ ] `POST /api/v1/auth/signup` with same email → 409 Conflict
- [ ] `POST /api/v1/auth/signup` with weak password → 400 with field errors
- [ ] `POST /api/v1/auth/login` with correct creds → 200, accessToken in body, `refreshToken` cookie set
- [ ] `POST /api/v1/auth/login` with wrong password → 401 (same message as wrong email)
- [ ] `POST /api/v1/auth/login` 6 times rapidly → 6th returns 429
- [ ] `GET /api/v1/auth/me` with valid token → 200, user data
- [ ] `GET /api/v1/auth/me` without token → 401
- [ ] `POST /api/v1/auth/logout` → 200, cookie cleared
- [ ] `GET /api/v1/auth/me` with the SAME token after logout → 401 (blacklisted)
- [ ] `POST /api/v1/auth/refresh` with valid cookie → 200, new accessToken
- [ ] `POST /api/v1/auth/signup` with adminKey matching env → user.role === 'admin'
- [ ] Check MongoDB Atlas — user document exists, passwordHash is a bcrypt hash

---

## PHASE 4 — Backend: Course + Section + Lesson APIs

**What you're building:** All course management — public listing, course detail with curriculum, and admin CRUD for courses, sections, and lessons.

### AI Prompt
```
I'm building VeoLMS course management. Auth system from Phase 3 is complete.

Build the complete course + section + lesson system:

1. src/models/course.model.ts
   Fields: createdBy(ObjectId ref User), title, slug(unique, lowercase),
   category(enum: Frontend|Backend|Fullstack|Other), shortDescription(max 160),
   description(HTML string), thumbnail(String), trailerVideo(String, default null),
   price(Number, min 0), isPublished(Boolean, default false),
   totalDuration(Number, default 0), totalLessons(Number, default 0),
   tags([String], default [])
   Indexes:
   - { title: 'text', tags: 'text' } — for search
   - { category: 1, isPublished: 1 }
   - { isPublished: 1, createdAt: -1 }
   - { slug: 1 } unique

2. src/models/section.model.ts
   Fields: course(ObjectId ref Course), title, order(Number min 0)
   Index: { course: 1, order: 1 }
   Timestamps: createdAt only

3. src/models/lesson.model.ts
   Fields: section(ObjectId ref Section), course(ObjectId ref Course, REQUIRED — denormalized),
   title, videoUrl(String, select: false), cloudinaryPublicId(String, select: false),
   duration(Number, default 0), order(Number), isPreview(Boolean, default false)
   Indexes: { section: 1, order: 1 }, { course: 1 }, { _id: 1, course: 1 }
   Timestamps: createdAt only

4. src/validators/course.validators.ts
   - createCourseSchema, updateCourseSchema (all fields optional)
   - createSectionSchema, updateSectionSchema
   - createLessonSchema, updateLessonSchema
   - reorderSchema: { orderedIds: string[] }
   - publishCourseSchema (validate at least 1 section + lesson exists — do this in service)

5. src/dao/course.dao.ts
   - findAll(filters, sort, page, limit): queries isPublished:true + optional $text + category
   - findBySlug(slug, isPublished?: boolean)
   - findById(id)
   - create(data)
   - updateById(id, data)
   - deleteById(id)
   - updateCache(courseId): recalculates totalLessons + totalDuration from lessons collection
     $lookup aggregate or countDocuments + sum — update Course document

6. src/dao/section.dao.ts
   - findByCourse(courseId): sorted by order asc
   - findById(id)
   - create(data)
   - updateById(id, data)
   - deleteById(id)
   - reorder(courseId, orderedIds): Promise.all bulk update order field

7. src/dao/lesson.dao.ts
   - findByCourse(courseId): sorted by section, order
   - findBySection(sectionId): sorted by order
   - findById(id)
   - findByIdWithVideo(id): .select('+videoUrl +cloudinaryPublicId')
   - create(data)
   - updateById(id, data)
   - deleteById(id)
   - reorder(sectionId, orderedIds): Promise.all bulk update

8. src/services/course.service.ts
   getCourses(filters, page, limit)
   getCourseWithCurriculum(slug, userId?)
     → fetch course + sections + lessons (no videoUrl)
     → if userId: check enrollment, add isEnrolled flag
     → build nested curriculum array: sections with lessons embedded
   createCourse(adminId, data)
     → slugify title → check uniqueness (append -2, -3 if collision)
     → sanitize description with DOMPurify (use jsdom as window for server-side)
   updateCourse(courseId, data)
     → if title changes, regenerate slug
     → if description changes, re-sanitize
   deleteCourse(courseId)
     → fetch all lessons → delete Cloudinary videos (Promise.all)
     → delete in order: Progress → Enrollments → Reviews → Lessons → Sections → Course
   togglePublish(courseId)
     → validate: has sections, has lessons, has thumbnail
     → toggle isPublished
   addSection, updateSection, deleteSection, reorderSections
   addLesson, updateLesson, deleteLesson, reorderLessons
   — addLesson/deleteLesson must call CourseDAO.updateCache(courseId)

9. src/controllers/course.controller.ts — thin, just parse + call service + respond
   src/controllers/section.controller.ts
   src/controllers/lesson.controller.ts

10. src/routes/course.routes.ts
    GET    /                          [optionalAuth, searchRateLimit]
    GET    /:slug                     [optionalAuth]
    POST   /                          [requireAuth, requireRole('admin'), validate]
    PATCH  /:id                       [requireAuth, requireRole('admin'), validate]
    DELETE /:id                       [requireAuth, requireRole('admin')]
    PATCH  /:id/publish               [requireAuth, requireRole('admin')]
    POST   /:courseId/sections        [requireAuth, requireRole('admin'), validate]

    src/routes/section.routes.ts (mount at /sections)
    PATCH  /:sectionId                [requireAuth, requireRole('admin')]
    DELETE /:sectionId                [requireAuth, requireRole('admin')]
    PATCH  /reorder                   [requireAuth, requireRole('admin')]
    POST   /:sectionId/lessons        [requireAuth, requireRole('admin'), validate]

    src/routes/lesson.routes.ts (mount at /lessons)
    PATCH  /:lessonId                 [requireAuth, requireRole('admin')]
    DELETE /:lessonId                 [requireAuth, requireRole('admin')]
    PATCH  /reorder                   [requireAuth, requireRole('admin')]
    GET    /:lessonId/video           [optionalAuth]  ← security-critical, see below

    GET /:lessonId/video logic (IN CONTROLLER, not middleware):
      1. Find lesson (no videoUrl)
      2. If lesson.isPreview → generate signed URL → return
      3. Else if !req.user → throw UnauthorizedError
      4. Else check enrollment { student: userId, course: lesson.course, status: 'completed' }
      5. If not enrolled → throw ForbiddenError
      6. Fetch lesson WITH videoUrl (.select('+videoUrl +cloudinaryPublicId'))
      7. Generate Cloudinary signed URL (1 hour TTL)
      8. Return { url: signedUrl, expiresIn: 3600 }

    src/utils/cloudinary.utils.ts:
      generateSignedUrl(publicId, expiresInSeconds = 3600): string
        Use cloudinary.url(publicId, { resource_type:'video', sign_url:true,
        type:'upload', expires_at: Math.floor(Date.now()/1000) + expiresInSeconds })
      deleteVideo(publicId): call cloudinary.uploader.destroy(publicId, {resource_type:'video'})
      deleteImage(publicId): call cloudinary.uploader.destroy(publicId)

Update src/routes/index.ts to mount all new routes.
```

### What To Review
- Read `lesson.controller.ts` — the `getVideoUrl` function specifically, trace each branch
- Read `course.service.ts` `deleteCourse` — understand the cascade delete order
- Read `CourseDAO.updateCache` — understand why it exists (cached totalLessons on Course)

### Verification Checklist
- [ ] `GET /api/v1/courses` → 200, empty array (no courses yet, that's fine)
- [ ] `POST /api/v1/courses` without auth → 401
- [ ] `POST /api/v1/courses` with student token → 403
- [ ] `POST /api/v1/courses` with admin token + valid body → 201, slug auto-generated, isPublished: false
- [ ] `POST /api/v1/courses` with same title → slug gets `-2` suffix
- [ ] `GET /api/v1/courses/:slug` → 200 with curriculum (sections + lessons, no videoUrl)
- [ ] `PATCH /api/v1/courses/:id/publish` with no lessons → 400 validation error
- [ ] Add section + 2 lessons via API, then publish → 200, isPublished: true
- [ ] `GET /api/v1/courses/:slug/video` on a locked lesson without auth → 401
- [ ] `GET /api/v1/courses/:slug/video` on a locked lesson with unenrolled student → 403
- [ ] `GET /api/v1/courses/:slug/video` on a preview lesson → 200 with signed URL (no auth needed)
- [ ] Signed URL contains expiry timestamp and signature (inspect the URL)
- [ ] `DELETE /api/v1/courses/:id` → 200, verify no orphan sections/lessons in MongoDB
- [ ] `GET /api/v1/courses?q=javascript` → text search works
- [ ] `GET /api/v1/courses?category=Frontend` → filter works
- [ ] Check lesson document in MongoDB — `videoUrl` field NOT visible in default find

---

## PHASE 5 — Backend: Upload System

**What you're building:** Video and image upload from admin panel directly to Cloudinary. No file storage on server.

### AI Prompt
```
I'm building VeoLMS upload system. Cloudinary SDK initialized in src/config/cloudinary.ts.

Build:

1. src/middleware/upload.middleware.ts
   Use multer with memoryStorage() — files stay in RAM, never touch disk
   videoUpload: single('video'), limit 500MB,
     fileFilter: only video/mp4, video/webm, video/quicktime — reject others with AppError
   imageUpload: single('image'), limit 5MB,
     fileFilter: only image/jpeg, image/png, image/webp — reject others

2. src/services/upload.service.ts
   uploadVideo(fileBuffer: Buffer, mimetype: string): Promise<VideoUploadResult>
     - Stream buffer to Cloudinary using cloudinary.uploader.upload_stream
     - Use streamifier.createReadStream(buffer).pipe(stream)
     - folder: 'veolms/lessons', resource_type: 'video'
     - Return: { url, publicId, duration, format, bytes }
   uploadImage(fileBuffer: Buffer, mimetype: string): Promise<ImageUploadResult>
     - Same pattern, resource_type: 'image', folder: 'veolms/thumbnails'
     - Return: { url, publicId }

3. src/controllers/upload.controller.ts
   uploadVideo: check req.file exists → call service → sendSuccess
   uploadImage: check req.file exists → call service → sendSuccess

4. src/routes/upload.routes.ts
   POST /video — [requireAuth, requireRole('admin'), uploadLimit, videoUpload, asyncHandler(uploadVideo)]
   POST /image — [requireAuth, requireRole('admin'), uploadLimit, imageUpload, asyncHandler(uploadImage)]

Add to src/routes/index.ts: mount upload routes at /upload

The response for video upload returns:
{
  url: "https://res.cloudinary.com/...",   ← stored in lesson.videoUrl (select:false)
  publicId: "veolms/lessons/...",          ← stored in lesson.cloudinaryPublicId
  duration: 420,                           ← seconds, from Cloudinary
  format: "mp4",
  bytes: 52428800
}
Frontend will:
1. Call POST /upload/video → get url + publicId + duration
2. Call POST /lessons (add lesson) with those values
Never directly reference the raw url after storing — always use signed URL endpoint
```

### Verification Checklist
- [ ] `POST /api/v1/upload/video` with a real MP4 file (admin token) → 200, Cloudinary URL returned
- [ ] `POST /api/v1/upload/video` with a .txt file → 400 file type rejected
- [ ] `POST /api/v1/upload/video` with 0 file → 400 "No file provided"
- [ ] `POST /api/v1/upload/image` with PNG → 200, Cloudinary image URL returned
- [ ] Open Cloudinary dashboard → see uploaded files in `veolms/lessons/` and `veolms/thumbnails/`
- [ ] `POST /api/v1/upload/video` 31 times rapidly → 31st returns 429

---

## PHASE 6 — Backend: Payment System

**What you're building:** Razorpay order creation + frontend payment verification + webhook handler with HMAC verification.

### AI Prompt
```
I'm building VeoLMS payment system with Razorpay.

Context:
- Enrollment model will be created in this phase
- Auth middleware exists
- AppError classes exist

1. src/models/enrollment.model.ts
   Fields: student(ObjectId ref User), course(ObjectId ref Course),
   razorpayOrderId(String, required, unique),
   razorpayPaymentId(String, default null),
   amount(Number, required), status(enum: pending|completed|failed, default: pending),
   lastWatchedLesson(ObjectId ref Lesson, default null),
   progressPercent(Number, default 0, min 0, max 100),
   enrolledAt(Date, default Date.now)
   Timestamps: updatedAt only
   Indexes:
   - { student: 1, course: 1 } unique  ← prevents double enrollment
   - { course: 1, status: 1 }
   - { enrolledAt: -1 }

2. src/validators/payment.validators.ts
   createOrderSchema: { courseId: valid ObjectId string }
   verifyPaymentSchema: { razorpayOrderId, razorpayPaymentId, razorpaySignature }

3. src/dao/enrollment.dao.ts
   findByStudentAndCourse(studentId, courseId): finds completed enrollment
   create(data): creates new enrollment
   upsertCompleted(razorpayOrderId, paymentId): findOneAndUpdate set status:completed
   findMyEnrollments(studentId): populate course + lastWatchedLesson, status:completed
   findAllEnrollments(filters, page, limit)
   updateProgress(studentId, courseId, progressPercent, lastLessonId)

4. src/services/payment.service.ts
   createOrder(userId, courseId):
     → find course (must be published)
     → check no existing completed enrollment (throw 400 if already enrolled)
     → create Razorpay order: amount = course.price * 100 (paise), currency INR
       notes: { courseId, userId }
     → create Enrollment { status: 'pending', razorpayOrderId, amount: course.price }
     → return { orderId, amount: course.price*100, currency, keyId }

   verifyPayment(userId, razorpayOrderId, razorpayPaymentId, razorpaySignature):
     → verify HMAC: hmac('sha256', KEY_SECRET).update(orderId+'|'+paymentId).digest('hex')
     → if mismatch: throw new AppError('Invalid payment signature', 400)
     → upsertCompleted(razorpayOrderId, razorpayPaymentId) — idempotent
     → return enrollment with courseSlug

   handleWebhook(rawBody: Buffer, signature: string):
     → verify HMAC using WEBHOOK_SECRET + crypto.timingSafeEqual
     → parse body: const event = JSON.parse(rawBody.toString())
     → if event.event === 'payment.captured':
         const { order_id, id: paymentId } = event.payload.payment.entity
         await EnrollmentDAO.upsertCompleted(order_id, paymentId)
     → always return { received: true } — do NOT throw, always 200

5. src/controllers/payment.controller.ts
   createOrder: [validate, call service, sendSuccess 201]
   verifyPayment: [validate, call service, sendSuccess]
   webhook: raw body is Buffer → call service.handleWebhook → res.json({received:true})
             catch errors but ALWAYS return 200 (Razorpay retries on non-200)

6. src/routes/payment.routes.ts
   POST /create-order — [requireAuth, paymentLimit, validate(createOrderSchema), asyncHandler]
   POST /verify      — [requireAuth, validate(verifyPaymentSchema), asyncHandler]
   POST /webhook     — [asyncHandler(webhook)]  ← NO rate limit, NO json middleware

   ⚠ CRITICAL: The webhook route must come BEFORE express.json() in app.ts
   (already handled in Phase 2 app.ts setup)

Mount at /payments in routes/index.ts
```

### Verification Checklist
- [ ] `POST /api/v1/payments/create-order` with valid courseId + student token → 201, Razorpay orderId returned
- [ ] `POST /api/v1/payments/create-order` for same course twice → 400 "Already enrolled"
- [ ] Check MongoDB: Enrollment document with status: 'pending' created
- [ ] In Postman: simulate `POST /api/v1/payments/verify` with valid Razorpay test signature → 200
- [ ] After verify: check MongoDB Enrollment has status: 'completed' and razorpayPaymentId set
- [ ] Test webhook with a simulated Razorpay webhook payload + correct HMAC signature → 200
- [ ] Test webhook with wrong signature → 400 (signature invalid)
- [ ] Test webhook with valid signature but for an order that verify already processed → 200 (idempotent, no error)
- [ ] `GET /api/v1/enrollments/my` after completed enrollment → returns the course

---

## PHASE 7 — Backend: Enrollment + Progress APIs

**What you're building:** Student enrollment reads + the progress tracking system (the 30-second auto-save).

### AI Prompt
```
I'm building VeoLMS enrollment and progress APIs.

1. src/models/progress.model.ts
   Fields: student(ObjectId ref User), lesson(ObjectId ref Lesson),
   course(ObjectId ref Course — denormalized), watchedSeconds(Number, min 0, default 0),
   totalSeconds(Number, min 0, default 0), completed(Boolean, default false),
   lastWatchedAt(Date, default Date.now)
   Timestamps: updatedAt only
   Indexes:
   - { student: 1, lesson: 1 } unique  ← one progress per student per lesson
   - { student: 1, course: 1 }         ← get all progress for course dashboard
   - { lesson: 1, completed: 1 }       ← admin analytics

2. src/validators/progress.validators.ts
   progressSchema: { lessonId(ObjectId), courseId(ObjectId), watchedSeconds(min 0), totalSeconds(min 1) }
   Refinement: watchedSeconds <= totalSeconds

3. src/dao/progress.dao.ts
   upsertProgress(studentId, lessonId, courseId, watchedSeconds, totalSeconds, completed)
     → findOneAndUpdate({ student, lesson }, $set: all fields, { upsert:true, new:true })
   findByLesson(studentId, lessonId)
   findByCourse(studentId, courseId): all progress docs for student in course
   countCompleted(studentId, courseId): count where completed: true

4. src/services/progress.service.ts
   saveProgress(userId, lessonId, courseId, watchedSeconds, totalSeconds):
     → completed = watchedSeconds >= totalSeconds * 0.9
     → upsertProgress(...)
     → if newly completed (completed true, old doc had false):
         completedCount = await ProgressDAO.countCompleted(userId, courseId)
         course = await CourseDAO.findById(courseId) — get totalLessons
         percent = Math.round(completedCount / course.totalLessons * 100)
         await EnrollmentDAO.updateProgress(userId, courseId, percent, lessonId)
     → return { watchedSeconds, completed, progressPercent: calculated percent }

   getProgress(userId, lessonId): returns { watchedSeconds, totalSeconds, completed } or zeros
   getCourseProgress(userId, courseId): array of { lessonId, completed, watchedSeconds }

5. src/services/enrollment.service.ts
   getMyEnrollments(userId): EnrollmentDAO.findMyEnrollments(userId)
   getRecentProgress(userId):
     Progress.find({ student: userId }).sort({ lastWatchedAt: -1 }).limit(10)
     .populate('lesson', 'title duration').populate('course', 'title slug thumbnail')

6. Controllers + Routes:
   src/controllers/progress.controller.ts
   src/controllers/enrollment.controller.ts

   src/routes/progress.routes.ts
   POST   /           [requireAuth, validate(progressSchema), asyncHandler(saveProgress)]
   GET    /:lessonId  [requireAuth, asyncHandler(getProgress)]
   GET    /course/:courseId [requireAuth, asyncHandler(getCourseProgress)]

   src/routes/enrollment.routes.ts
   GET /my         [requireAuth, asyncHandler(getMyEnrollments)]
   GET /my/recent  [requireAuth, asyncHandler(getRecentProgress)]
   GET /           [requireAuth, requireRole('admin'), asyncHandler(getAllEnrollments)]

Mount both in routes/index.ts
```

### Verification Checklist
- [ ] `POST /api/v1/progress` with valid lessonId/courseId for enrolled student → 200
- [ ] Call it again with watchedSeconds = 90% of totalSeconds → response shows `completed: true`
- [ ] Check Enrollment document in MongoDB: `progressPercent` updated, `lastWatchedLesson` updated
- [ ] Call progress again with already-completed lesson → still 200, no double-counting
- [ ] `GET /api/v1/progress/:lessonId` → returns saved watchedSeconds (resume playback data)
- [ ] `GET /api/v1/progress/course/:courseId` → array with completion status per lesson
- [ ] `GET /api/v1/enrollments/my` → returns enrolled courses with progressPercent on each
- [ ] `GET /api/v1/enrollments/my/recent` → returns last 10 watched lessons with course info

---

## PHASE 8 — Backend: Admin APIs + Seed Script

**What you're building:** Admin stats/analytics and the seed script that populates your demo data.

### AI Prompt
```
I'm building VeoLMS admin APIs and seed script.

1. src/services/admin.service.ts
   getStats():
     Promise.all([
       Course.countDocuments(),
       User.countDocuments({ role: 'student' }),
       Enrollment.aggregate([
         { $match: { status: 'completed' } },
         { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
       ]),
       Enrollment.find({ status:'completed' })
         .sort({ enrolledAt: -1 }).limit(5)
         .populate('student','name email').populate('course','title thumbnail')
     ])
     Return: { totalCourses, totalStudents, totalEnrollments, totalRevenue, recentEnrollments }

   getAnalytics():
     revenuePerCourse: Enrollment aggregate → group by course → lookup course title → sort
     enrollmentsByDay: Enrollment aggregate last 30 days → group by date string → sort

   getAllStudents(query, page, limit):
     User.find({ role:'student', ...searchQuery }).sort({ createdAt:-1 }).paginate

2. src/controllers/admin.controller.ts + src/routes/admin.routes.ts
   GET /stats        [requireAuth, requireRole('admin'), asyncHandler]
   GET /students     [requireAuth, requireRole('admin'), asyncHandler]
   GET /students/:id/enrollments [requireAuth, requireRole('admin'), asyncHandler]
   GET /analytics    [requireAuth, requireRole('admin'), asyncHandler]

3. src/seeds/data/courses.data.ts
   Export array of 5 courses with this structure:
   {
     title, slug, category, shortDescription, description(HTML),
     thumbnail(real Cloudinary URL or placeholder), price,
     tags: string[],
     sections: [
       {
         title, order,
         lessons: [
           { title, videoUrl(YouTube or Cloudinary URL), cloudinaryPublicId, duration, order, isPreview }
         ]
       }
     ]
   }
   Courses: HTML Fundamentals, CSS Mastery, JavaScript Essentials, React Complete Guide, Redux Toolkit
   Each: 3+ sections, 5+ lessons minimum
   First lesson of each: isPreview: true
   Use real YouTube video URLs for videoUrl (public videos from Hitesh Choudhary's channel)
   for cloudinaryPublicId use placeholder strings like 'seed/lesson-1' etc.

4. src/seeds/index.ts
   - Connect to DB + Redis
   - Accept --fresh flag: if present, drop all collections first
   - Create admin user: { name:'Admin', email:'admin@veolms.com', password:'Admin@123', role:'admin' }
   - Create student user: { name:'Student', email:'student@veolms.com', password:'Student@123' }
   - For each course in courses.data.ts:
       create Course (admin as createdBy, isPublished: true)
       for each section: create Section
       for each lesson in section: create Lesson
       call CourseDAO.updateCache(courseId) after all lessons created
   - Log progress: "✅ Created course: HTML Fundamentals (6 lessons)"
   - Script: add to package.json "seed": "ts-node src/seeds/index.ts"

Mount admin routes in routes/index.ts
```

### Verification Checklist
- [ ] `pnpm seed` runs without errors, logs all 5 courses created
- [ ] Check MongoDB: 5 Course documents, sections, lessons all exist
- [ ] Course `totalLessons` and `totalDuration` are populated (not 0)
- [ ] `GET /api/v1/courses` → returns 5 published courses
- [ ] `GET /api/v1/admin/stats` with admin token → totalCourses: 5
- [ ] `GET /api/v1/admin/analytics` → returns revenuePerCourse array
- [ ] `pnpm seed --fresh` → drops collections first then reseeds cleanly

---

## PHASE 9 — Backend Final Integration Test

**No AI prompt for this phase — this is your manual verification pass.**

### What To Do
1. Open your API spec doc (VeoLMS_API_Spec.md)
2. Go through EVERY endpoint in the route summary table
3. Test each one with Postman or Thunder Client
4. Document any failures

### Full Integration Checklist
- [ ] Auth: all 6 endpoints working
- [ ] Courses: public listing with search + filter working
- [ ] Course detail: curriculum shows sections + lessons, no videoUrl exposed
- [ ] Video signed URL: preview → works without auth; locked → requires enrollment
- [ ] Sections + lessons CRUD: admin can create/edit/delete/reorder
- [ ] Upload: video + image both reach Cloudinary
- [ ] Payment: create-order → verify flow → enrollment created
- [ ] Webhook: simulated payload → enrollment completed
- [ ] Progress: save → GET → completion threshold works
- [ ] Dashboard data: enrollments + recent lessons returning
- [ ] Admin stats: correct counts
- [ ] Admin analytics: revenue + timeline data
- [ ] Rate limits: auth endpoints reject on 6th attempt in 15 min
- [ ] Health: DB + Redis status both show "connected"
- [ ] Error format: all errors return `{ success: false, message, errors? }`
- [ ] No passwordHash ever appears in any response (inspect all user-returning endpoints)
- [ ] No videoUrl ever appears in curriculum response

**If any of the above fail — fix them before starting Phase 10.**
The frontend is built on the assumption these APIs work correctly.

---

## PHASE 10 — Frontend Bootstrap + Store + Axios + Routes

**What you're building:** Redux store, RTK Query base, Axios with token refresh interceptor, all routes wired up, providers.

### AI Prompt
```
I'm building VeoLMS frontend (React 18 + TypeScript + Vite + Redux Toolkit).

Backend API is running at http://localhost:5000/api/v1

1. src/types/ — all TypeScript interfaces:
   user.types.ts: IUser { _id, name, email, role, avatar, createdAt }
   course.types.ts: ICourse (all fields), ISection, ILesson (no videoUrl), ICurriculum
   enrollment.types.ts: IEnrollment with populated course + lastWatchedLesson
   progress.types.ts: IProgress, ICourseProgress
   api.types.ts: APIResponse<T>, PaginatedResponse<T>

2. src/constants/routes.ts — ROUTES constant (all routes as typed functions)
3. src/constants/api.ts — API_BASE_URL from import.meta.env.VITE_API_BASE_URL

4. src/shared/libs/axios.ts
   Create Axios instance with baseURL = API_BASE_URL
   withCredentials: true  ← required for httpOnly refresh cookie
   Request interceptor: attach accessToken from Redux store to Authorization header
   Response interceptor: on 401 → call /auth/refresh → retry original request
   If refresh fails → dispatch logout action → redirect to /login

5. src/shared/state/baseApi.ts
   RTK Query createApi with:
   - baseQuery: fetchBaseQuery using axiosBaseQuery wrapper (use axios instance)
     OR use fetchBaseQuery with prepareHeaders to inject token
   - reducerPath: 'api'
   - tagTypes: ['User','Course','Enrollment','Progress','Admin']

6. src/features/auth/state/auth.slice.ts
   State: { user: IUser|null, accessToken: string|null, isAuthenticated: boolean, isLoading: boolean }
   Actions: setCredentials(user, accessToken), logout(), setLoading(boolean)

7. src/app/app.store.ts
   combineReducers: auth (from auth.slice), api (from RTK Query)
   Apply rtkQueryErrorMiddleware

8. src/providers/ThemeProvider.tsx
   Context: theme ('dark'|'light'), toggleTheme()
   Default: 'dark' — read from localStorage on init
   Apply 'dark' class to <html> element (Tailwind dark mode)
   Export useTheme() hook

9. src/providers/AuthProvider.tsx
   On mount: if accessToken in Redux → call GET /auth/me → setCredentials
   If /auth/me fails → dispatch logout
   While loading: show full-page spinner (prevents flash of wrong state)
   Export: this wraps the app and ensures auth is rehydrated before rendering routes

10. src/providers/index.tsx
    Wrap in order: <Provider store> → <ThemeProvider> → <AuthProvider> → children

11. src/shared/components/guards/ProtectedRoute.tsx
    Uses useAuth hook — redirects to /login with state.from = current location if not authenticated
    Shows spinner while isLoading

12. src/shared/components/guards/AdminRoute.tsx
    Redirects to / if authenticated but not admin

13. src/app/app.routes.tsx
    All routes from the folder structure doc — public, student-protected, admin-protected

14. src/main.tsx
    <RouterProvider router={router}> wrapped in <Providers>

15. src/features/auth/api/auth.api.ts
    RTK Query endpoints: signup, login, logout, refresh, getMe, updateProfile

16. src/features/auth/hooks/useAuth.ts
    Returns: { user, isAuthenticated, isLoading, role } from Redux state

Create placeholder pages for now (just <div>PageName</div>) for all routes.
The goal is: app loads, routes work, Redux store initializes, dark mode applies.
```

### Verification Checklist
- [ ] App loads at localhost:5173 with dark background (#0A0A0A)
- [ ] Navigate to `/login` → renders (even if just a div)
- [ ] Navigate to `/dashboard` without being logged in → redirected to `/login`
- [ ] Navigate to `/admin` without being logged in → redirected to `/login`
- [ ] Redux DevTools (browser extension) shows `auth` slice and `api` slice
- [ ] ThemeProvider: toggle should switch class on `<html>`
- [ ] No TypeScript errors in terminal

---

## PHASE 11 — Frontend: Auth UI

**What you're building:** Login page, Signup page, full auth flow, token refresh working end to end.

### AI Prompt
```
I'm building VeoLMS auth UI. Backend auth API is working. Redux + Axios + RTK Query set up.

Build complete auth UI:

1. src/shared/components/ui/ — Design system components:
   Button.tsx: variants prop: 'primary'(orange solid), 'secondary'(outline), 'ghost'
     sizes: 'sm', 'md', 'lg'. Loading state: spinner + disabled. Use cn() utility.
   Input.tsx: label, error, placeholder, type props. Show error message below field.
     Focus ring: orange. Dark + light theme aware.
   Spinner.tsx: animated circle, size prop
   Toast.tsx: use a simple fixed-position toast system (no external library needed)
     Types: success (green), error (red), info (blue)

2. src/utils/cn.ts: clsx + tailwind-merge for conditional class merging

3. src/features/auth/hooks/useAuthForm.ts
   loginForm: { email, password, isLoading, error, handleChange, handleSubmit }
     → on submit: call loginMutation → on success: setCredentials → navigate to state.from or /dashboard
   signupForm: same pattern, navigates to /dashboard after success

4. src/pages/public/LoginPage.tsx
   Dark background, centered card (max-w-md)
   VeoLMS logo/wordmark at top
   Email + Password inputs
   "Forgot password?" link (non-functional, v1)
   Submit button with loading state
   Link to /signup
   On error: show toast

5. src/pages/public/SignupPage.tsx
   Name + Email + Password fields
   Show password strength indicator (just 4 colored bars based on criteria)
   Submit button
   Link to /login
   Admin registration note: "Have an admin key? Enter it to register as admin"
   Optional adminKey field (toggle visibility with a checkbox)

6. src/shared/components/layout/Navbar.tsx
   Left: VeoLMS logo + wordmark
   Center (desktop): navigation links (Home, Courses)
   Right: theme toggle icon button + Login/Signup buttons if not authenticated
          OR avatar + "Dashboard" + "Logout" if authenticated
   Mobile: hamburger menu → slide-in drawer with same links
   Fixed position, blur backdrop, subtle border-bottom

7. After login/signup → /dashboard (even if dashboard is placeholder for now)
   After logout → /

Design requirements:
- Dark: bg-[#0A0A0A], cards bg-[#111111], border border-[#1F1F1F]
- Orange accent: text-orange-500, bg-orange-500 for primary buttons
- Typography: Inter font
- Smooth transitions on hover/focus
- Mobile-first responsive
```

### Verification Checklist
- [ ] Visit `/signup` → form renders with all fields
- [ ] Submit with weak password → field-level validation errors show
- [ ] Valid signup → redirected to `/dashboard` (placeholder), user in Redux state
- [ ] Visit `/login` → submit with correct creds → authenticated, Navbar shows avatar
- [ ] Logout button → clears Redux state, redirected to `/`, Navbar shows Login/Signup
- [ ] After logout: navigate to `/dashboard` → redirected to `/login`
- [ ] Token refresh: manually expire access token (set JWT_ACCESS_SECRET to wrong value, then fix it) → Axios interceptor calls /refresh automatically
- [ ] Navbar: dark theme toggle works, persists on refresh (localStorage)
- [ ] Mobile (375px viewport): hamburger menu opens/closes
- [ ] Admin signup with correct adminKey → user.role = 'admin' in Redux

---

## PHASE 12 — Frontend: Homepage + Course Listing

### AI Prompt
```
I'm building VeoLMS public pages. Auth is working. Backend has 5 seeded courses.

1. src/features/courses/api/courses.api.ts
   RTK Query endpoints:
   - getCourses(filters): GET /courses?q=&category=&sort=&page=&limit=
   - getCourseBySlug(slug): GET /courses/:slug
   - (admin): createCourse, updateCourse, deleteCourse, publishCourse

2. src/features/courses/components/CourseCard.tsx
   Props: course (ICourse)
   Card: dark surface, rounded-xl, hover scale(1.02) + shadow
   - Thumbnail image (aspect-video, object-cover)
   - Category badge (color by category)
   - Title (2 lines max, truncate)
   - Instructor name
   - lesson count + duration (formatted)
   - Price: ₹999 in orange

3. src/features/courses/components/CourseCardSkeleton.tsx
   Same card shape but animated pulse placeholders

4. src/features/courses/components/CourseGrid.tsx
   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
   Maps over courses, shows skeletons while loading

5. src/pages/public/HomePage.tsx
   Sections:
   A. Hero: large headline "Learn. Build. Ship." + subtext + CTA buttons
      Background: dark, subtle hexagon pattern (SVG background or Tailwind bg)
      Right: placeholder instructor image area or gradient blob
   B. Featured Courses: "Trending" section heading + CourseGrid (limit 6)
   C. Why VeoLMS: 3 feature tiles (Learn by Building, Progress Tracking, Secure)
   D. Stats bar: "5 Courses", "100% Project Based", "Real Payment Flow" etc (static)

6. src/pages/public/CoursesPage.tsx
   src/features/courses/components/CourseSearchBar.tsx
   src/features/courses/components/CourseCategoryFilter.tsx
   - URL-synced filters: ?q= and ?category= update URL on change
   - useSearchParams hook to read/write filters
   - Debounce search input (300ms) using useDebounce hook
   - CourseGrid shows filtered results
   - Empty state: "No courses found for your search"

Design: match ChaiCode reference — dark, editorial, bold headings, orange accents
```

### Verification Checklist
- [ ] Homepage loads, shows 5+ course cards (from seed data)
- [ ] Card hover effect: slight scale + shadow
- [ ] Course search: type "javascript" → only JS course appears (debounced, no flicker)
- [ ] Category filter: click "Frontend" → only frontend courses
- [ ] Both filters combined work
- [ ] Empty state shows when no results
- [ ] Skeleton cards show during loading
- [ ] Mobile: cards stack to 1 column
- [ ] Course card click → navigates to `/courses/:slug`

---

## PHASE 13 — Frontend: Course Detail + Payment Flow

### AI Prompt
```
I'm building VeoLMS course detail page and Razorpay payment flow.

1. src/pages/public/CourseDetailPage.tsx
   Fetch course by slug from URL params
   Layout:
   - Hero: thumbnail/trailer, title, short description, instructor, stats (lessons, duration)
   - Left column (wider): full description (dangerouslySetInnerHTML — DOMPurify sanitized)
   - Right column: sticky purchase card
     → EnrollButton component
     → Price, lesson count, what you'll get (static list)
   - Curriculum accordion: sections expand/collapse, lessons listed with duration
     → Preview lessons: play icon (clickable, opens preview modal or routes to learn page)
     → Locked lessons: lock icon

2. src/features/payment/hooks/useRazorpay.ts
   loadRazorpayScript(): dynamically loads https://checkout.razorpay.com/v1/checkout.js
   initiatePayment(course: ICourse):
     → call POST /payments/create-order
     → load Razorpay script if not loaded
     → open Rzp modal with orderId, amount, keyId, name, description, image
     → handler callback on success: call POST /payments/verify with payment details
     → on verify success: dispatch enrollment update → navigate to /learn/:slug/:firstLessonId
     → on modal close without payment: show toast "Payment cancelled"

3. src/features/payment/components/EnrollButton.tsx
   Props: course, isEnrolled
   If enrolled: "Continue Learning →" button → navigate to last watched lesson
   If not enrolled + not authenticated: "Login to Enroll" → navigate to /login?redirect=
   If not enrolled + authenticated: "Enroll Now — ₹{price}" → useRazorpay.initiatePayment

4. src/features/payment/state/payment.slice.ts
   paymentStatus: 'idle' | 'loading' | 'success' | 'failed'
   After successful enrollment: add courseId to local enrolled courses list

5. src/features/payment/components/PaymentStatusModal.tsx
   Success: green check, "You're enrolled!" message + "Start Learning" button
   Failed: red X, "Payment failed" + "Try Again" button
```

### Verification Checklist
- [ ] Course detail page loads with all sections
- [ ] Curriculum accordion: sections expand and collapse
- [ ] Preview lesson: click play icon → video signed URL fetched → plays
- [ ] Locked lesson: click → shows "Login to access" or "Enroll to access"
- [ ] Not logged in → "Login to Enroll" button redirects to login with redirect param
- [ ] After login → redirected back to course page
- [ ] "Enroll Now" → Razorpay modal opens with correct course name and amount
- [ ] Complete test payment (card: 4111 1111 1111 1111, any expiry/CVV)
- [ ] After payment → redirected to `/learn/:slug/:firstLessonId`
- [ ] Revisit course detail → button now shows "Continue Learning →"
- [ ] Check MongoDB: Enrollment status is 'completed'

---

## PHASE 14 — Frontend: Learn Page (Video Player + Progress)

### AI Prompt
```
I'm building VeoLMS learn page with Plyr video player and progress tracking.

1. src/features/learn/components/LearnLayout.tsx
   Full viewport height layout: no standard navbar
   Left: LessonSidebar (collapsible on mobile, fixed width 320px on desktop)
   Right: main content area with VideoPlayer

2. src/features/learn/components/LessonSidebar.tsx
   - Course title at top
   - Sections as collapsible groups
   - Each lesson: title, duration, completed checkmark (green) or circle
   - Currently playing lesson: orange highlight + playing indicator
   - Click lesson → check enrollment → navigate or show locked message

3. src/features/learn/components/VideoPlayer.tsx
   Use Plyr with HTML5 video source
   - On mount: fetch signed URL from GET /lessons/:lessonId/video
   - Set as video src
   - Initialize Plyr instance with options:
     controls: ['play','progress','current-time','mute','volume','fullscreen','settings','speed']
     speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
     keyboard: { focused: true, global: true }
   - Plyr theme customized to orange accent (--plyr-color-main: #F97316)

4. src/features/learn/hooks/useProgressTracker.ts
   On Plyr 'timeupdate': track currentTime + duration
   Save progress when:
   - 'pause' event fires
   - 'ended' event fires (mark completed)
   - Every 30 seconds (setInterval, cleared on unmount)
   POST to /api/v1/progress with { lessonId, courseId, watchedSeconds, totalSeconds }
   Use debounce on the interval save (prevent duplicate rapid calls)

5. src/features/learn/hooks/useVideoPlayer.ts
   - Fetch signed URL on lesson change
   - Init Plyr
   - On lesson end: auto-navigate to next lesson
   - On mount: fetch existing progress → seek to watchedSeconds (resume)
   - Cleanup Plyr instance on unmount

6. src/features/learn/hooks/useLearnNavigation.ts
   - currentLessonIndex from course curriculum
   - nextLesson(), prevLesson() computed
   - Keyboard: ArrowRight → next lesson (if ended)

7. src/pages/student/LearnPage.tsx
   - Fetch course curriculum by slug
   - Fetch course progress on mount
   - Render LearnLayout with sidebar + player
   - Update sidebar checkmarks when progress changes
```

### Verification Checklist
- [ ] Navigate to `/learn/html-fundamentals/[lessonId]` → video player loads
- [ ] Plyr controls visible: play, seek, volume, speed, fullscreen
- [ ] Keyboard: Space plays/pauses, F = fullscreen, M = mute
- [ ] Speed selector works (0.5x → 2x)
- [ ] After 30 seconds of playing → check MongoDB Progress document updated
- [ ] Pause video → progress saved immediately
- [ ] Refresh page → video resumes from where you left off (watchedSeconds)
- [ ] Watch 90%+ of video → lesson shows checkmark in sidebar
- [ ] Video ends → auto-navigates to next lesson
- [ ] Sidebar: current lesson highlighted in orange
- [ ] Sidebar: completed lessons show green checkmark
- [ ] Signed URL expires after 1 hour (test: manually set expires_at to 1 second, verify player gets 403 after expiry)
- [ ] Mobile: sidebar collapses, video is full width

---

## PHASE 15 — Frontend: Student Dashboard

### AI Prompt
```
I'm building VeoLMS student dashboard.

1. src/features/dashboard/api/dashboard.api.ts
   RTK Query: getMyEnrollments, getRecentProgress

2. src/pages/student/DashboardPage.tsx
   Layout: greeting (Hi, {name}!), then 3 sections:

   A. Continue Learning widget (top priority)
      Shows LAST watched lesson across all courses
      Card: course thumbnail + course title + lesson title + progress bar + "Resume" button
      → Resume navigates to /learn/:slug/:lastWatchedLessonId

   B. My Courses grid
      src/features/dashboard/components/EnrolledCourseCard.tsx
      Card: thumbnail, title, progress bar (progressPercent%), "Continue" button
      "X of Y lessons" text

   C. Recently Watched
      src/features/dashboard/components/RecentlyWatched.tsx
      List of last 10 lessons with course thumbnail + lesson title + time ago

All sections show skeletons while loading.
Empty state: if no enrollments → "You haven't enrolled in any courses yet" + Browse Courses button
```

### Verification Checklist
- [ ] Dashboard loads with enrolled courses
- [ ] Progress bar shows correct percentage per course
- [ ] "Continue" button navigates to correct lesson (lastWatchedLesson)
- [ ] Recently watched list updates after watching a lesson
- [ ] Empty state shows if no enrollments
- [ ] Skeletons show during data fetch

---

## PHASE 16 — Frontend: Admin Dashboard + Course List

### AI Prompt
```
I'm building VeoLMS admin dashboard.

1. src/features/admin/components/AdminSidebar.tsx
   Links: Dashboard, Courses, Students, Enrollments, Analytics
   Active link: orange highlight
   VeoLMS logo at top
   Collapse to icons on mobile

2. src/pages/admin/AdminDashboardPage.tsx
   4 stat cards: Total Courses, Total Students, Total Enrollments, Total Revenue (₹)
   Recent Enrollments table: student name, course, amount, date

3. src/pages/admin/AdminCoursesPage.tsx
   Table columns: Thumbnail, Title, Status (Draft/Published badge), Lessons, Price, Actions
   Actions: Edit button, Delete button (confirm dialog), Publish/Unpublish toggle
   "Create New Course" button → navigates to /admin/courses/new

4. src/features/admin/components/CourseTable.tsx
   Handle loading, empty, and error states
   Delete: show confirmation modal first
   Publish toggle: optimistic update (toggle immediately, revert on error)
```

### Verification Checklist
- [ ] `/admin` shows correct stats matching MongoDB counts
- [ ] Course table shows all 5 seeded courses
- [ ] Draft/Published badge shows correctly
- [ ] Delete course → confirmation modal → confirmed → course removed from table
- [ ] Publish toggle → badge changes immediately

---

## PHASE 17 — Frontend: Admin Curriculum Builder

### AI Prompt
```
I'm building VeoLMS admin course creation and curriculum builder.

1. src/pages/admin/AdminCourseFormPage.tsx
   Step 1: Course Details
   - Title (auto-generates slug preview)
   - Category dropdown
   - Short description (160 char counter)
   - Full description: TipTap editor with Bold, Italic, Heading, BulletList, OrderedList
   - Thumbnail: drag-drop or click → POST /upload/image → preview URL
   - Trailer video upload (optional): same pattern
   - Price input (₹ prefix)
   - "Save & Continue to Curriculum" button

   Step 2: Curriculum Builder
   src/features/admin/components/SectionBuilder.tsx
   - "Add Section" button
   - Each section: title input + "Add Lesson" button + drag handle
   - Sections can be deleted
   src/features/admin/components/LessonBuilder.tsx inside each section:
   - Lesson title input
   - Video upload: file picker → POST /upload/video → shows progress bar during upload
     → on success: stores url + publicId + duration from response
   - isPreview toggle (checkbox)
   - Delete lesson button

2. src/features/admin/components/VideoUploader.tsx
   Props: onUploadComplete(result: { url, publicId, duration })
   Show: drag zone OR file picker
   Upload progress: use XMLHttpRequest with onprogress (Axios doesn't support progress easily)
   States: idle → uploading (progress bar) → success (filename + duration) → error

3. On form save:
   If new course: POST /courses → POST sections → POST lessons (sequential per section)
   If editing: PATCH /courses/:id + handle section/lesson changes

Keep it simple — no drag-to-reorder in v1. Just add/delete is enough.
```

### Verification Checklist
- [ ] Create new course → fill all fields → thumbnail uploads → preview shows
- [ ] Add 2 sections, add 2 lessons per section → video upload progress bar shows
- [ ] Save → course appears in admin course table
- [ ] Edit existing course → fields pre-populated
- [ ] Delete lesson → removed from UI
- [ ] TipTap editor: bold, italic, headings work
- [ ] After saving: visit `/courses/:newSlug` publicly → course visible with curriculum

---

## PHASE 18 — Frontend: Admin Students + Analytics

### AI Prompt
```
Build VeoLMS admin students page and analytics.

1. src/pages/admin/AdminStudentsPage.tsx
   Searchable table: name, email, enrolled courses count, join date
   Click row → expand or navigate to student detail (their enrollments)

2. src/pages/admin/AdminAnalyticsPage.tsx
   Use Recharts:
   - BarChart: revenue per course (title on X axis, revenue on Y axis, orange bars)
   - LineChart: enrollments over last 30 days (date on X, count on Y)
   Both charts: responsive container, tooltips, clean dark theme styling

3. src/features/admin/components/RevenueChart.tsx
   src/features/admin/components/EnrollmentTimelineChart.tsx
   Both: skeleton loader while fetching, empty state if no data
```

### Verification Checklist
- [ ] Students table shows all registered students
- [ ] Search by name filters the table
- [ ] Analytics page: both charts render with real data
- [ ] Charts are responsive on mobile (no overflow)
- [ ] Tooltips show on hover with correct values

---

## PHASE 19 — Polish Pass

**No single AI prompt — this is a series of targeted prompts.**

### 19A — Skeleton Loaders Everywhere
```
Add Tailwind skeleton loading states to every data-fetching component in VeoLMS.
Use animate-pulse with bg-[#1F1F1F] placeholders.
Components needing skeletons: CourseCard, EnrolledCourseCard, CourseTable,
StudentTable, AdminStatsCard, LessonSidebar, DashboardPage sections.
```

### 19B — Error Boundaries + Empty States
```
Add React Error Boundary to VeoLMS app.
Every list page needs an empty state component.
Every API error should show a user-friendly message with retry button.
Network errors: "Check your internet connection"
403 on video: "Purchase this course to access this lesson"
```

### 19C — Light Theme
```
Add light theme to VeoLMS. Toggle is already in Navbar.
Light background: #FAFAFA, surface: #FFFFFF, text: #09090B
All components use Tailwind dark: variants.
Ensure Plyr player also adapts to light theme.
Test every page in light mode.
```

### 19D — Mobile Polish
```
Audit VeoLMS on 375px viewport. Fix:
- Navbar hamburger menu
- Course grid (1 col on mobile)
- Learn page: sidebar drawer, video full width
- Admin sidebar: collapses on mobile
- Forms: full width inputs
- Tables: horizontal scroll or stacked layout
```

### Verification Checklist Phase 19
- [ ] Every loading state shows skeleton, not blank/spinner
- [ ] Every empty state has a helpful message + action
- [ ] Light mode: every page looks correct, no dark text on dark bg
- [ ] Mobile (375px): no horizontal overflow on any page
- [ ] Mobile navbar: hamburger opens, all links work
- [ ] Learn page mobile: video loads full width, sidebar as drawer

---

## PHASE 20 — Deployment

### AI Prompt
```
Help me deploy VeoLMS to production.

Backend deployment (Render):
1. Create render.yaml OR manual Web Service setup
2. Build command: pnpm build (tsc)
3. Start command: node dist/server.js
4. Set all environment variables in Render dashboard
5. Add health check URL: /api/v1/health
6. Connect GitHub repo for auto-deploy on push to main

Frontend deployment (Vercel):
1. Import GitHub repo
2. Framework: Vite
3. Build command: pnpm build
4. Output: dist/
5. Set VITE_API_BASE_URL = https://your-render-url.onrender.com/api/v1

Post-deployment configuration:
1. MongoDB Atlas: Network Access → Allow 0.0.0.0/0 (or Render IPs)
2. Cloudinary: add production domain to allowed origins
3. Razorpay: add webhook URL in dashboard → https://your-api.onrender.com/api/v1/payments/webhook
4. Run pnpm seed against production DB (set MONGODB_URI to Atlas URI)
5. Update CORS CLIENT_URL to Vercel URL

Give me a deployment verification checklist.
```

### Final Deployment Verification Checklist
- [ ] `https://your-app.vercel.app` loads with dark theme
- [ ] Signup with new email → works on production
- [ ] Browse courses → 5 seeded courses visible
- [ ] Purchase a course with test payment → enrolled + redirect to learn page
- [ ] Video plays on production (signed Cloudinary URL works)
- [ ] Progress saves → refresh → resumes from same position
- [ ] Admin login → dashboard shows stats
- [ ] Admin: create a new course with real video upload → visible publicly
- [ ] Mobile: test on real phone, all pages usable
- [ ] Razorpay webhook: trigger a test payment → check Render logs → webhook received

---

## Quick Reference — Estimated Time Per Phase

| Phase | Description | Estimated Time |
|---|---|---|
| 1 | Bootstrap | 2–3 hours |
| 2 | Backend config + app | 3–4 hours |
| 3 | Auth system | 4–5 hours |
| 4 | Course + Section + Lesson | 5–6 hours |
| 5 | Upload | 2–3 hours |
| 6 | Payments | 4–5 hours |
| 7 | Enrollment + Progress | 3–4 hours |
| 8 | Admin APIs + Seed | 3–4 hours |
| 9 | Backend integration test | 2–3 hours |
| 10 | Frontend bootstrap | 3–4 hours |
| 11 | Auth UI | 4–5 hours |
| 12 | Homepage + Courses | 4–5 hours |
| 13 | Course detail + Payment | 5–6 hours |
| 14 | Learn page + Video | 6–8 hours |
| 15 | Student Dashboard | 3–4 hours |
| 16 | Admin Dashboard + List | 4–5 hours |
| 17 | Curriculum Builder | 5–6 hours |
| 18 | Analytics + Students | 3–4 hours |
| 19 | Polish pass | 4–5 hours |
| 20 | Deployment | 3–4 hours |
| **Total** | | **~75–95 hours** |

At 8–10 hours/day focused: **8–12 days**.
You have until July 15. You're fine.

---

## Interview Prep Notes (Continuous)

As you build each phase, write answers to these in a notes doc:

**After Phase 3:** Why same error for wrong email vs wrong password?
**After Phase 4:** Why is `videoUrl` select:false? Why is `courseId` on Lesson (denormalized)?
**After Phase 6:** Why both webhook AND /verify endpoint? What is `timingSafeEqual` and why?
**After Phase 7:** Why upsert instead of insert for progress? What is the 90% threshold for?
**After Phase 8:** Why `totalLessons` cached on Course instead of counting live?
**After Phase 14:** How does resume playback work technically? What if the signed URL expires mid-watch?
**After Phase 20:** What would you change if you had 10,000 concurrent users?

---

*This document is your complete build playbook. Follow it phase by phase. Do not skip verification checklists. The checklist is not optional — it is your quality gate.*
