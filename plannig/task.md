# VeoLMS — Task Tracker

## Phase 1 — Bootstrap Fixes
- [/] Fix tsconfig.json (rootDir, outDir, module)
- [/] Install missing backend dependencies
- [/] Create .env.example
- [/] Create nodemon.json
- [/] Create .prettierrc / .eslintrc.json

## Phase 2 — Config, DB, Redis, App Setup
- [ ] src/config/config.ts
- [ ] src/config/database.ts
- [ ] src/config/redis.ts
- [ ] src/config/cloudinary.ts
- [ ] src/config/razorpay.ts
- [ ] src/types/express.d.ts
- [ ] src/types/common.types.ts
- [ ] src/utils/asyncHandler.ts
- [ ] src/utils/apiResponse.ts
- [ ] src/utils/jwt.utils.ts
- [ ] src/middleware/errorHandler.middleware.ts
- [ ] src/middleware/rateLimiter.middleware.ts
- [ ] src/app.ts (full middleware stack)
- [ ] src/routes/index.ts
- [ ] server.ts (entry point)

## Phase 3 — Auth System
- [ ] src/models/user.model.ts
- [ ] src/validators/auth.validators.ts
- [ ] src/middleware/validate.middleware.ts
- [ ] src/middleware/auth.middleware.ts
- [ ] src/dao/user.dao.ts
- [ ] src/services/auth.service.ts
- [ ] src/controllers/auth.controller.ts
- [ ] src/routes/auth.routes.ts
- [ ] Update routes/index.ts

## Phase 4 — Course + Section + Lesson APIs
- [ ] src/models/course.model.ts
- [ ] src/models/section.model.ts
- [ ] src/models/lesson.model.ts
- [ ] src/validators/course.validators.ts
- [ ] src/dao/course.dao.ts
- [ ] src/dao/section.dao.ts
- [ ] src/dao/lesson.dao.ts
- [ ] src/services/course.service.ts
- [ ] Controllers + routes
- [ ] src/utils/cloudinary.utils.ts

## Phase 5 — Upload System
- [ ] src/middleware/upload.middleware.ts
- [ ] src/services/upload.service.ts
- [ ] src/controllers/upload.controller.ts
- [ ] src/routes/upload.routes.ts

## Phase 6 — Payment System
- [ ] src/models/enrollment.model.ts
- [ ] src/validators/payment.validators.ts
- [ ] src/dao/enrollment.dao.ts
- [ ] src/services/payment.service.ts
- [ ] src/controllers/payment.controller.ts
- [ ] src/routes/payment.routes.ts

## Phase 7 — Enrollment + Progress APIs
- [ ] src/models/progress.model.ts
- [ ] src/validators/progress.validators.ts
- [ ] src/dao/progress.dao.ts
- [ ] src/services/progress.service.ts
- [ ] src/services/enrollment.service.ts
- [ ] Controllers + routes

## Phase 8 — Admin APIs + Seed Script
- [ ] src/services/admin.service.ts
- [ ] src/controllers/admin.controller.ts
- [ ] src/routes/admin.routes.ts
- [ ] src/seeds/data/courses.data.ts
- [ ] src/seeds/index.ts
