# VeoLMS - Task Tracker

## Phase 1 - Bootstrap Fixes
- [x] Fix tsconfig.json (rootDir, outDir, module)
- [x] Install missing backend dependencies
- [x] Create .env.example
- [x] Create nodemon.json
- [x] Create .prettierrc / .eslintrc.json

## Phase 2 - Config, DB, Redis, App Setup
- [x] src/config/config.ts
- [x] src/config/database.ts
- [x] src/config/redis.ts
- [x] src/config/cloudinary.ts
- [x] src/config/razorpay.ts
- [x] src/types/express.d.ts
- [x] src/types/common.types.ts
- [x] src/utils/asyncHandler.ts
- [x] src/utils/apiResponse.ts
- [x] src/utils/jwt.utils.ts
- [x] src/middleware/errorHandler.middleware.ts
- [x] src/middleware/rateLimiter.middleware.ts
- [x] src/app.ts (full middleware stack)
- [x] src/routes/index.ts
- [x] server.ts (entry point)

## Phase 3 - Auth System
- [x] src/models/user.model.ts
- [x] src/validators/auth.validators.ts
- [x] src/middleware/validate.middleware.ts
- [x] src/middleware/auth.middleware.ts
- [x] src/dao/user.dao.ts
- [x] src/services/auth.service.ts
- [x] src/controllers/auth.controller.ts
- [x] src/routes/auth.routes.ts
- [x] Update routes/index.ts

## Phase 4 - Course + Section + Lesson APIs
- [x] src/models/course.model.ts
- [x] src/models/section.model.ts
- [x] src/models/lesson.model.ts
- [x] src/validators/course.validators.ts
- [x] src/dao/course.dao.ts
- [x] src/dao/section.dao.ts
- [x] src/dao/lesson.dao.ts
- [x] src/services/course.service.ts
- [x] Controllers + routes
- [x] src/utils/cloudinary.utils.ts

## Phase 5 - Upload System
- [x] src/middleware/upload.middleware.ts
- [x] src/services/upload.service.ts
- [x] src/controllers/upload.controller.ts
- [x] src/routes/upload.routes.ts
- [x] Integrate course create/update with multipart thumbnail upload
- [x] Integrate lesson create/update with multipart video upload

## Phase 6 - Payment System
- [ ] src/models/enrollment.model.ts
- [ ] src/validators/payment.validators.ts
- [ ] src/dao/enrollment.dao.ts
- [ ] src/services/payment.service.ts
- [ ] src/controllers/payment.controller.ts
- [ ] src/routes/payment.routes.ts

## Phase 7 - Enrollment + Progress APIs
- [ ] src/models/progress.model.ts
- [ ] src/validators/progress.validators.ts
- [ ] src/dao/progress.dao.ts
- [ ] src/services/progress.service.ts
- [ ] src/services/enrollment.service.ts
- [ ] Controllers + routes

## Phase 8 - Admin APIs + Seed Script
- [ ] src/services/admin.service.ts
- [ ] src/controllers/admin.controller.ts
- [ ] src/routes/admin.routes.ts
- [ ] src/seeds/data/courses.data.ts
- [ ] src/seeds/index.ts
