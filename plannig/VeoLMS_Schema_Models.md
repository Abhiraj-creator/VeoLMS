# VeoLMS — Database Schema & Mongoose Models
**Step 2 of 10 | Based on PRD v1.0**

---

## Collection Overview

| Collection | Purpose | Key Relationships |
|---|---|---|
| `users` | All platform users (students + admins) | Base entity for everything |
| `courses` | Course catalog | Created by user; has sections |
| `sections` | Chapter groupings within a course | Belongs to course; has lessons |
| `lessons` | Individual video lessons | Belongs to section + course |
| `enrollments` | Payment + enrollment record | Student ↔ Course |
| `progress` | Per-lesson watch progress | Student ↔ Lesson ↔ Course |
| `reviews` | Star ratings + comments | Student ↔ Course (v1 model-ready, UI later) |

---

## Schema Design Decisions

### Why `lesson.course` is denormalized (redundant FK)?
Lesson already belongs to a section which belongs to a course. But having `courseId` directly on the Lesson document avoids a two-hop lookup (`lesson → section → course`) every time we need to verify enrollment before serving a video URL. This is a deliberate MongoDB denormalization for read performance at the cost of one extra field.

### Why separate `Progress` collection instead of embedding in `Enrollment`?
A student enrolled in a 30-lesson course would have an `Enrollment` document with 30 embedded progress objects. Updating a single lesson's progress would rewrite the entire document. Separate `Progress` documents mean each update is a targeted upsert on a tiny document. Better write performance, simpler queries.

### Why `totalDuration` and `totalLessons` on `Course`?
These are **pre-computed cached values** updated whenever a lesson is added/deleted. The alternative is a `$lookup` aggregation on every course card render. For a homepage with 20 course cards, that's expensive. Cache invalidation is simple: recalculate on lesson create/delete.

### Why `progressPercent` on `Enrollment`?
Same reasoning. Dashboard shows progress for all enrolled courses. Calculating `completedLessons / totalLessons` in real-time means aggregating the `Progress` collection for each enrollment. Pre-caching on `Enrollment` makes the dashboard a single collection query.

---

## 1. User Model

```typescript
// server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'student' | 'admin'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Instance method
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,           // Creates index automatically
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,          // NEVER returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,           // Cloudinary URL
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,          // Admin can deactivate accounts
    },
  },
  {
    timestamps: true,         // Adds createdAt + updatedAt automatically
  }
)

// Instance method — compare plain password against stored hash
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Pre-save hook — hash password only when modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

// Indexes
// email has unique: true (auto-indexed above)
UserSchema.index({ role: 1 })         // Admin queries: find all students
UserSchema.index({ createdAt: -1 })   // Admin dashboard: recent signups

export const User = mongoose.model<IUser>('User', UserSchema)
```

**Interview notes:**
- `select: false` on `passwordHash` is critical — it means `User.find()` never accidentally returns password hashes in API responses. You must explicitly use `.select('+passwordHash')` to get it.
- The pre-save hook only hashes when `isModified('passwordHash')` — prevents double-hashing on `profile.save()` when updating name/avatar.

---

## 2. Course Model

```typescript
// server/src/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose'

export type CourseCategory = 'Frontend' | 'Backend' | 'Fullstack' | 'Other'

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId     // Admin who created it
  title: string
  slug: string
  category: CourseCategory
  shortDescription: string               // Max 160 chars — used on cards
  description: string                    // HTML from TipTap rich text editor
  thumbnail: string                      // Cloudinary URL
  trailerVideo?: string                  // Cloudinary URL (optional)
  price: number                          // In INR paise (Razorpay standard) or rupees
  isPublished: boolean
  totalDuration: number                  // Cached — sum of lesson durations (seconds)
  totalLessons: number                   // Cached — count of lessons
  tags: string[]                         // For search text index
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title too short'],
      maxlength: [120, 'Title too long'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Example: "complete-javascript-guide"
      // Generated from title on backend before save
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Fullstack', 'Other'],
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: [160, 'Short description max 160 chars'],
    },
    description: {
      type: String,
      required: true,
      // Stores TipTap HTML output. DOMPurify sanitizes before save.
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    trailerVideo: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      // Store in rupees (e.g. 999 = ₹999)
      // Convert to paise (×100) when creating Razorpay order
    },
    isPublished: {
      type: Boolean,
      default: false,           // Courses start as Draft
    },
    totalDuration: {
      type: Number,
      default: 0,               // Updated by a utility function on lesson add/delete
    },
    totalLessons: {
      type: Number,
      default: 0,               // Same
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Text index for search — enables $text queries on title + tags
CourseSchema.index({ title: 'text', tags: 'text' })
// Filter queries
CourseSchema.index({ category: 1, isPublished: 1 })
CourseSchema.index({ isPublished: 1, createdAt: -1 })  // Homepage featured list
CourseSchema.index({ slug: 1 })                         // Course detail page lookup

export const Course = mongoose.model<ICourse>('Course', CourseSchema)
```

**Interview notes:**
- `slug` is the URL-safe identifier (`/courses/complete-javascript-guide`). Using `_id` in URLs leaks internal DB info and is ugly. Slugs are SEO-friendly too.
- Text index on `title` + `tags` enables MongoDB `$text` search — the backend of the search bar. Much lighter than a regex query.
- `totalDuration` and `totalLessons` are **cache fields** — never query the lessons collection to get these numbers.

---

## 3. Section Model

```typescript
// server/src/models/Section.ts
import mongoose, { Document, Schema } from 'mongoose'

export interface ISection extends Document {
  _id: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  title: string
  order: number              // Controls display order in curriculum
  createdAt: Date
}

const SectionSchema = new Schema<ISection>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [100, 'Section title too long'],
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Compound index: fetch all sections for a course in order
SectionSchema.index({ course: 1, order: 1 })

export const Section = mongoose.model<ISection>('Section', SectionSchema)
```

**Interview note:** `order` field enables drag-to-reorder in the admin panel. We sort by `order: 1` when fetching. When admin reorders, we bulk-update the order values. Simple and avoids linked-list complexity.

---

## 4. Lesson Model

```typescript
// server/src/models/Lesson.ts
import mongoose, { Document, Schema } from 'mongoose'

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId
  section: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId      // Denormalized — avoids section lookup to check enrollment
  title: string
  videoUrl: string                     // Cloudinary secure_url (NEVER sent raw to frontend)
  cloudinaryPublicId: string           // Used to delete from Cloudinary when lesson is deleted
  duration: number                     // Seconds — returned by Cloudinary on upload
  order: number
  isPreview: boolean                   // If true, accessible without enrollment
  createdAt: Date
}

const LessonSchema = new Schema<ILesson>(
  {
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,                  // Denormalized FK — intentional
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [150, 'Lesson title too long'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      select: false,                   // NEVER returned in public course queries
                                       // Only retrieved in the signed URL generation endpoint
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      select: false,                   // Internal — not needed by frontend
    },
    duration: {
      type: Number,
      default: 0,                      // Seconds, provided by Cloudinary
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Fetch all lessons for a section in order
LessonSchema.index({ section: 1, order: 1 })
// Enrollment check: find all lessons for a course
LessonSchema.index({ course: 1 })
// Used in signed URL endpoint: verify lesson belongs to course before generating URL
LessonSchema.index({ _id: 1, course: 1 })

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema)
```

**Interview notes:**
- `videoUrl` has `select: false` — just like `passwordHash`. This is the most important security decision in the schema. Public course listing queries (`GET /courses/:slug`) populate lessons for the curriculum display. If `videoUrl` is returned here, any user can get the raw Cloudinary URL, bypass signed URL protection, and share it forever. `select: false` ensures the raw URL is only retrieved in the one endpoint that generates signed URLs — after auth + enrollment check.
- `cloudinaryPublicId` is needed to call `cloudinary.uploader.destroy(publicId)` when a lesson is deleted. Without it you'd have orphaned videos in Cloudinary.

---

## 5. Enrollment Model

```typescript
// server/src/models/Enrollment.ts
import mongoose, { Document, Schema } from 'mongoose'

export type EnrollmentStatus = 'pending' | 'completed' | 'failed'

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId?: string
  amount: number                      // In rupees (same unit as Course.price)
  status: EnrollmentStatus
  lastWatchedLesson?: mongoose.Types.ObjectId
  progressPercent: number             // Cached — updated when Progress is saved
  enrolledAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,               // Each Razorpay order maps to exactly one enrollment
    },
    razorpayPaymentId: {
      type: String,
      default: null,              // Null until payment is captured
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    lastWatchedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

// Core access control query: "Is this student enrolled in this course?"
// Used on EVERY video request — must be a covered index
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true })
// ^^ unique: true prevents double-enrollment even if the webhook fires twice (idempotency)

// Admin: list all enrollments for a course (analytics)
EnrollmentSchema.index({ course: 1, status: 1 })
// Admin: list all enrollments (dashboard)
EnrollmentSchema.index({ enrolledAt: -1 })

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
```

**Interview notes:**
- The compound unique index `{ student: 1, course: 1 }` is doing two jobs: it's the lookup key for "is this student enrolled?" AND it prevents duplicate enrollments even if Razorpay's webhook fires twice (race condition). This is your idempotency guarantee at the database level.
- `status: 'pending'` enrollment is created when `create-order` is called. It becomes `completed` only after webhook signature verification. This means you can detect abandoned checkouts.
- `progressPercent` is updated by the progress save endpoint — whenever a lesson is marked complete, recalculate and update this field.

---

## 6. Progress Model

```typescript
// server/src/models/Progress.ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId     // Denormalized — avoids lesson lookup for course-level queries
  watchedSeconds: number
  totalSeconds: number
  completed: boolean                  // true when watchedSeconds >= totalSeconds * 0.9
  lastWatchedAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,                 // Denormalized FK — intentional
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSeconds: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

// THE most important index — upsert query hits this every 30 seconds per active lesson
// Must be unique: one progress doc per student per lesson
ProgressSchema.index({ student: 1, lesson: 1 }, { unique: true })

// Dashboard: get all progress for a student in a course
ProgressSchema.index({ student: 1, course: 1 })

// Analytics: how many students completed a lesson
ProgressSchema.index({ lesson: 1, completed: 1 })

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema)
```

**Interview notes:**
- Upsert pattern: `Progress.findOneAndUpdate({ student, lesson }, { $set: { ... } }, { upsert: true, new: true })`. This is atomic — no race condition between check-then-insert.
- The `completed` field uses a 90% threshold: `completed = watchedSeconds >= totalSeconds * 0.9`. Marks lesson complete even if user doesn't watch the last few seconds (they might skip the outro).

---

## 7. Review Model

```typescript
// server/src/models/Review.ts
// Data model is complete — UI is deprioritized for v1 but backend endpoints can be added
import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  rating: number                      // 1–5
  comment?: string
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating min 1'],
      max: [5, 'Rating max 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment too long'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// One review per student per course
ReviewSchema.index({ student: 1, course: 1 }, { unique: true })
// Fetch all reviews for a course
ReviewSchema.index({ course: 1, createdAt: -1 })

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
```

---

## Index Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| users | `email` | Unique | Login lookup |
| users | `role` | Regular | Admin: list students |
| courses | `slug` | Unique | Course page URL lookup |
| courses | `title + tags` | Text | Search bar |
| courses | `category + isPublished` | Compound | Filter by category |
| courses | `isPublished + createdAt` | Compound | Homepage listing |
| sections | `course + order` | Compound | Curriculum display |
| lessons | `section + order` | Compound | Lesson list in section |
| lessons | `course` | Regular | Enrollment check path |
| enrollments | `student + course` | **Unique Compound** | Auth guard (is enrolled?) |
| enrollments | `course + status` | Compound | Admin analytics |
| progress | `student + lesson` | **Unique Compound** | Upsert progress (every 30s) |
| progress | `student + course` | Compound | Dashboard progress |
| reviews | `student + course` | **Unique Compound** | One review per student |

---

## Mongoose Query Patterns Reference

### Check if student is enrolled (runs on every video request)
```typescript
const enrollment = await Enrollment.findOne({
  student: userId,
  course: courseId,
  status: 'completed'
})
if (!enrollment) throw new ForbiddenError('Not enrolled')
```

### Get full course with curriculum (public course page)
```typescript
const course = await Course.findOne({ slug, isPublished: true })
  .populate('createdBy', 'name avatar')   // Only name + avatar, no passwordHash

const sections = await Section.find({ course: course._id })
  .sort({ order: 1 })

const lessons = await Lesson.find({ course: course._id })
  .sort({ section: 1, order: 1 })
  // videoUrl and cloudinaryPublicId are select: false — NOT included
```

### Upsert progress (every 30s from frontend)
```typescript
const progress = await Progress.findOneAndUpdate(
  { student: userId, lesson: lessonId },
  {
    $set: {
      watchedSeconds,
      totalSeconds,
      completed: watchedSeconds >= totalSeconds * 0.9,
      lastWatchedAt: new Date(),
      course: courseId,
    },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
)

// After upsert, update cached progressPercent on Enrollment
const completedCount = await Progress.countDocuments({
  student: userId,
  course: courseId,
  completed: true,
})
const course = await Course.findById(courseId).select('totalLessons')
const percent = Math.round((completedCount / course.totalLessons) * 100)

await Enrollment.updateOne(
  { student: userId, course: courseId },
  { $set: { progressPercent: percent, lastWatchedLesson: lessonId } }
)
```

### Admin analytics — revenue per course
```typescript
const revenue = await Enrollment.aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: '$course',
      totalRevenue: { $sum: '$amount' },
      enrollmentCount: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: 'courses',
      localField: '_id',
      foreignField: '_id',
      as: 'course',
    },
  },
  { $unwind: '$course' },
  { $sort: { totalRevenue: -1 } },
])
```

### Generate signed video URL (after enrollment check)
```typescript
import { v2 as cloudinary } from 'cloudinary'

// Fetch lesson with select('+videoUrl') to override select: false
const lesson = await Lesson.findById(lessonId).select('+videoUrl +cloudinaryPublicId')

const signedUrl = cloudinary.url(lesson.cloudinaryPublicId, {
  resource_type: 'video',
  sign_url: true,
  type: 'upload',
  expires_at: Math.floor(Date.now() / 1000) + 3600,  // 1 hour
})

return { url: signedUrl, expiresIn: 3600 }
```

---

## TypeScript Types Export (shared across models)

```typescript
// server/src/types/index.ts
import { Types } from 'mongoose'

export interface JWTPayload {
  userId: string
  role: 'student' | 'admin'
  iat: number
  exp: number
}

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId
    role: 'student' | 'admin'
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface APIResponse<T = null> {
  success: boolean
  message: string
  data?: T
}
```

---

## Seed Script Reference

```typescript
// server/src/seeds/index.ts
// Run with: npx ts-node src/seeds/index.ts

const COURSES_SEED = [
  {
    title: 'HTML Fundamentals',
    slug: 'html-fundamentals',
    category: 'Frontend',
    price: 999,
    sections: [
      {
        title: 'Getting Started',
        order: 0,
        lessons: [
          { title: 'What is HTML?', order: 0, isPreview: true, duration: 420 },
          { title: 'Your First HTML Page', order: 1, duration: 600 },
        ],
      },
      // ... more sections
    ],
  },
  // HTML, CSS, JS, React, Redux
]
```

---

*Step 2 complete. All 7 collections documented with full TypeScript interfaces, indexes, and query patterns.*  
*Next: Step 3 — REST API Specification*
