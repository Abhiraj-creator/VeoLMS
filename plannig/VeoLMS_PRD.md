# VeoLMS — Product Requirements Document (PRD)
**Version:** 1.0  
**Author:** Abhiraj (VeoLMS Core Team Submission)  
**Last Updated:** June 2026  
**Submission Deadline:** July 15, 2026  

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [Tech Stack & Architecture Decisions](#3-tech-stack--architecture-decisions)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Feature Specifications](#5-feature-specifications)
   - 5.1 Public Homepage
   - 5.2 Public Course Pages
   - 5.3 Authentication
   - 5.4 Student Dashboard
   - 5.5 Admin Dashboard
   - 5.6 Enrollment & Payments
   - 5.7 Video Experience
   - 5.8 Search & Discovery
6. [Security Requirements](#6-security-requirements)
7. [Cost Optimization Strategy](#7-cost-optimization-strategy)
8. [UI/UX Design Specification](#8-uiux-design-specification)
9. [API Overview](#9-api-overview)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Seed Data Plan](#11-seed-data-plan)
12. [Out of Scope (v1)](#12-out-of-scope-v1)
13. [Risks & Trade-offs](#13-risks--trade-offs)

---

## 1. Project Overview

**Product Name:** VeoLMS  
**Tagline:** Learn. Build. Ship.  
**Type:** Full-stack Learning Management System (LMS)  
**Inspiration:** Udemy for structure, ChaiCode (chaicode.com) for UI aesthetic  

VeoLMS is a production-grade LMS where instructors (Admins) can create and publish video courses, and students can browse, purchase, and consume those courses. The platform supports real payment flows (Razorpay test mode), secure video delivery, progress tracking, and role-based access control.

This is both a **VeoLMS Core Team submission** and a **portfolio centerpiece** demonstrating full-stack engineering, system design, security awareness, and product thinking.

---

## 2. Goals & Success Criteria

### Primary Goals
- A live, deployed LMS accessible at a public URL
- Real users can browse → register → purchase → watch courses without any local setup
- Admin can manage the full course lifecycle from the dashboard
- Security is demonstrable and explainable in a 1:1 technical interview

### Success Criteria (Minimum Bar)
| Criteria | Target |
|----------|--------|
| Courses live on deployment | ≥ 5 (HTML, CSS, JS, React, Redux) |
| Lessons per course | ≥ 5 |
| Payment flow | Razorpay test mode, webhook-verified |
| Video delivery | Self-hosted MP4 via Cloudinary/ImageKit with signed URLs |
| Auth security | JWT access + refresh tokens, Redis blacklist for logout |
| Mobile responsive | Yes, mobile-first |
| Light + Dark mode | Both themes supported |

---

## 3. Tech Stack & Architecture Decisions

### Frontend
| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | React 18 + TypeScript | Type safety, component reuse, familiarity |
| Routing | React Router v6 | SPA routing with protected route wrappers |
| State Management | Redux Toolkit + RTK Query | Centralized auth/user state; RTK Query for data fetching |
| HTTP Client | Axios (via RTK Query base) | Interceptors for token refresh |
| Styling | Tailwind CSS (mobile-first) | Rapid UI, responsive by default |
| Video Player | Plyr.js | Clean, accessible, keyboard shortcuts out of box |
| Rich Text (Admin) | TipTap | Lightweight React editor for course descriptions |
| Animations | Framer Motion (light use) | Page transitions, hover states |
| Icons | Lucide React | Consistent, tree-shakeable |

### Backend
| Decision | Choice | Reason |
|----------|--------|--------|
| Runtime | Node.js + Express | Familiarity, ecosystem, fast to build REST APIs |
| Language | TypeScript | Type safety across full stack |
| Database | MongoDB + Mongoose | Flexible schema, familiarity, good for nested course data |
| Cache / Session | Redis (Upstash free tier) | JWT blacklisting on logout, rate limiting store |
| Auth | JWT (access + refresh tokens) | Stateless, scalable; Redis handles revocation |
| Payment | Razorpay (test mode) | India-first, simple integration, webhook support |
| Video Storage | Cloudinary (free tier) or ImageKit | Direct upload from admin panel, signed URL delivery |
| File Storage | Cloudinary | Thumbnails, instructor images |

### Why MongoDB over PostgreSQL?
MongoDB fits well here because course content is hierarchical (Course → Sections → Lessons) and schema varies across courses. No complex relational joins needed. Mongoose ODM provides enough structure. This decision is explainable: "denormalized document model suits content hierarchies; we'd revisit for a multi-tenant SaaS."

### Why JWT + Redis over sessions?
JWT is stateless and works across multiple server instances. The problem with pure JWT is you can't revoke tokens on logout — Redis solves this by maintaining a blacklist of invalidated tokens until expiry. This shows security awareness beyond basic implementation.

### Why Razorpay over Stripe?
Indian payment gateway, no USD conversion, test mode is straightforward, and webhook signature verification is well-documented.

---

## 4. User Roles & Permissions

### Roles
| Role | Description |
|------|-------------|
| `guest` | Unauthenticated visitor |
| `student` | Authenticated, can purchase and watch courses |
| `admin` | Full platform access — create/edit/delete content, manage students |

### Admin Registration
Admin accounts are created via signup with a secret key (`ADMIN_SECRET_KEY` in env). Without the key, signup creates a `student` account. This prevents open admin registration while keeping the flow simple.

### Permission Matrix
| Action | Guest | Student | Admin |
|--------|-------|---------|-------|
| View homepage | ✅ | ✅ | ✅ |
| Browse courses | ✅ | ✅ | ✅ |
| View course page | ✅ | ✅ | ✅ |
| Watch free/preview lessons | ✅ | ✅ | ✅ |
| Purchase a course | ❌ | ✅ | ✅ |
| Watch paid lessons | ❌ | ✅ (enrolled only) | ✅ |
| Student dashboard | ❌ | ✅ | ❌ |
| Admin dashboard | ❌ | ❌ | ✅ |
| Create/edit/delete courses | ❌ | ❌ | ✅ |
| View all enrollments | ❌ | ❌ | ✅ |
| View revenue analytics | ❌ | ❌ | ✅ |

---

## 5. Feature Specifications

### 5.1 Public Homepage

**Access:** No authentication required  
**Design Reference:** ChaiCode homepage (dark theme, bold typography, warm amber accents)

#### Sections (in order)
1. **Navbar**
   - Logo + brand name
   - Search bar (desktop)
   - Login / Sign Up buttons (or user avatar if logged in)
   - Dark/light theme toggle

2. **Hero Section**
   - Large headline (e.g., "Learn. Build. Ship.")
   - Subheading (value proposition)
   - Primary CTA: "Start Learning →" → goes to `/courses`
   - Secondary CTA: "Browse Courses"
   - Trust badge: "X+ students enrolled"

3. **Featured Courses Section**
   - Horizontally scrollable course card grid
   - Each card: thumbnail, title, instructor, lesson count, price
   - "View All Courses" link

4. **Why VeoLMS Section**
   - 3–4 feature tiles (e.g., "Learn by Building", "Progress Tracking", "Secure Platform")

5. **Testimonials / Social Proof**
   - Static testimonial cards (seeded data, not user-generated for v1)

6. **Footer**
   - Links: Home, Courses, About, Contact
   - Copyright

#### Behavior
- Course cards link to `/courses/:slug`
- Search in navbar navigates to `/courses?q=searchterm`
- Responsive: stacked on mobile, grid on desktop

---

### 5.2 Public Course Pages

**Route:** `/courses` (listing) and `/courses/:slug` (detail)  
**Access:** No authentication required

#### Course Listing Page (`/courses`)
- Grid of all **published** courses
- Filter by category (Frontend, Backend, etc.)
- Search by title or keywords
- Each card: thumbnail, title, instructor, price, lesson count

#### Course Detail Page (`/courses/:slug`)
- Hero: title, thumbnail/trailer, instructor name
- Description (rendered from TipTap rich text)
- Curriculum accordion: Section → Lesson list
  - Free/preview lessons show a play icon
  - Paid lessons show a lock icon
- Purchase CTA: "Enroll Now — ₹X" → triggers Razorpay
- If already enrolled: "Continue Learning →" → goes to `/learn/:slug`
- Stats: total lessons, total duration (calculated), category

#### Preview Lesson Behavior
- First lesson of every course is always free to preview
- Admin can additionally mark specific lessons as `isPreview: true`
- Preview lessons are playable without login
- Attempting to play a locked lesson redirects to login if not authenticated, or shows "Purchase to Access" if authenticated but not enrolled

---

### 5.3 Authentication

**Routes:** `/login`, `/signup`, `/logout`

#### Signup Flow
1. User fills: name, email, password, (optional) `adminKey`
2. If `adminKey` matches `process.env.ADMIN_SECRET_KEY` → role = `admin`
3. Else → role = `student`
4. Password hashed with bcrypt (saltRounds: 12)
5. Access token (15 min expiry) + refresh token (7 days expiry) issued
6. Access token stored in memory (Redux state); refresh token in `httpOnly` cookie

#### Login Flow
1. Email + password validated against DB
2. Tokens issued same as signup
3. Failed attempts rate-limited (5 attempts per 15 min per IP via Redis)

#### Logout Flow
1. Access token added to Redis blacklist (TTL = remaining token expiry)
2. Refresh token cookie cleared
3. Redux state cleared

#### Token Refresh Flow
1. Axios interceptor catches 401 responses
2. Calls `/api/auth/refresh` with httpOnly cookie
3. New access token returned, original request retried
4. If refresh token is expired/invalid → force logout

#### Protected Routes (Frontend)
- React Router wrapper component checks Redux auth state
- Unauthorized access redirects to `/login?redirect=<original_path>`
- After login, user is redirected back to original path

---

### 5.4 Student Dashboard

**Route:** `/dashboard`  
**Access:** `student` role only

#### Sections
1. **My Courses**
   - Grid of enrolled courses
   - Each card: thumbnail, title, progress percentage bar
   - CTA: "Continue" → goes to last watched lesson

2. **Continue Learning**
   - Last watched lesson per course (not global — per-course resume)
   - Shows: course thumbnail, lesson title, progress %
   - CTA: "Resume" → deep link to that lesson

3. **Progress Overview**
   - Per-course: "X of Y lessons completed"
   - Visual progress bar

4. **Recently Watched**
   - Chronological list of last 10 lessons watched across all courses

#### Notes
- Ratings/reviews: supported in data model but UI deprioritized for v1 (backend ready, frontend skipped)

---

### 5.5 Admin Dashboard

**Route:** `/admin`  
**Access:** `admin` role only

#### Sidebar Navigation
- Dashboard (overview stats)
- Courses
- Students
- Enrollments
- Analytics

#### Dashboard Overview
- Total courses, total students, total enrollments, total revenue (cards)
- Recent enrollments table (student name, course, date, amount)

#### Course Management (`/admin/courses`)
- Table: all courses with title, status (Draft/Published), enrollments, price
- Actions: Edit, Delete, Toggle Publish
- "Create New Course" button

#### Course Creation / Edit Form (`/admin/courses/new` and `/admin/courses/:id/edit`)
**Step 1 — Course Details:**
- Title (required)
- Slug (auto-generated from title, editable)
- Category (dropdown: Frontend, Backend, Fullstack, Other)
- Short description (plain text, max 160 chars — used in cards)
- Full description (TipTap rich text editor)
- Thumbnail upload (Cloudinary upload, returns URL)
- Trailer video upload (optional, Cloudinary)
- Price (₹ INR)
- Status: Draft (default) or Published

**Step 2 — Curriculum Builder:**
- Add sections (drag to reorder)
- Inside each section: add lessons
- Each lesson:
  - Title
  - Video upload → Cloudinary → stores `videoUrl` and `duration`
  - `isPreview` toggle (free to watch without enrollment)
  - Order index

#### Video Upload Flow (Admin Panel)
1. Admin selects video file in lesson form
2. Frontend sends to backend `/api/upload/video` (multipart)
3. Backend streams directly to Cloudinary using `cloudinary.uploader.upload_stream`
4. Cloudinary returns `public_id`, `secure_url`, `duration`
5. These are saved in the lesson document
6. No video file is stored on the server

#### Student Management (`/admin/students`)
- Table: name, email, enrolled courses count, join date
- Click student → view their enrollments

#### Enrollment View (`/admin/enrollments`)
- Table: student, course, payment amount, payment date, status

#### Analytics (`/admin/analytics`)
- Total revenue (all time)
- Revenue per course (bar chart — Recharts)
- Enrollments over time (line chart — Recharts)
- Top 3 courses by enrollment

---

### 5.6 Enrollment & Payments

#### Payment Flow (Razorpay)

**Step 1 — Initiate (Frontend)**
1. Student clicks "Enroll Now" on course page
2. If not logged in → redirect to login with `?redirect=` back to course
3. POST `/api/payments/create-order` with `{ courseId }`
4. Backend creates Razorpay order, returns `{ orderId, amount, currency, keyId }`

**Step 2 — Payment UI**
1. Frontend opens Razorpay checkout modal with order details
2. Student completes test payment (card: 4111 1111 1111 1111)
3. On success: Razorpay fires webhook to backend AND returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to frontend

**Step 3 — Webhook Verification (Backend)**
1. Razorpay sends POST to `/api/payments/webhook`
2. Backend verifies HMAC-SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`
3. If valid: creates `Enrollment` document, marks payment as `completed`
4. Webhook response: 200 OK

**Step 4 — Frontend Confirmation**
1. Frontend also sends payment details to `/api/payments/verify` as backup
2. Backend verifies signature again (idempotent — no duplicate enrollment if webhook already processed)
3. Returns enrollment confirmation
4. Frontend redirects to `/learn/:slug`

**Why both webhook AND frontend verify?**
Webhooks can be delayed. Frontend verify gives immediate UX feedback. Webhook is the source of truth. Idempotency prevents double-enrollment.

#### Enrollment Model
```
Enrollment {
  student: ObjectId (ref: User)
  course: ObjectId (ref: Course)
  razorpayOrderId: String
  razorpayPaymentId: String
  amount: Number
  status: 'pending' | 'completed' | 'failed'
  enrolledAt: Date
}
```

---

### 5.7 Video Experience

**Route:** `/learn/:slug/:lessonId`  
**Access:** Enrolled students only (or `isPreview: true` lessons)

#### Access Control (Backend)
- Every video URL request goes through `/api/lessons/:lessonId/video`
- Backend checks:
  1. Is lesson `isPreview`? → Return signed URL
  2. Is user authenticated? → Check enrollment
  3. Is user enrolled in the course? → Return signed URL
  4. Else → 403 Forbidden
- Signed URL is generated via Cloudinary's signed delivery with 1-hour expiry
- The actual Cloudinary URL is **never exposed** to the frontend directly

#### Video Player (Plyr.js)
- Custom styled to match VeoLMS dark theme
- Controls: play/pause, seek bar, volume, fullscreen
- Keyboard shortcuts: Space (play/pause), F (fullscreen), M (mute), Arrow keys (seek ±5s)
- Speed controls: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Picture-in-picture support (browser native via Plyr)

#### Progress Tracking
- Frontend sends progress update to `/api/progress` on:
  - **Pause** event
  - **Lesson end** (video ended)
  - **Every 30 seconds** while playing (debounced, not queued)
- Payload: `{ lessonId, courseId, watchedSeconds, totalSeconds, completed: boolean }`
- Backend upserts `Progress` document
- Lesson marked `completed` when `watchedSeconds / totalSeconds >= 0.9` (90% threshold)

#### Lesson Sidebar
- Left: course curriculum accordion (sections → lessons)
- Completed lessons: checkmark icon
- Current lesson: highlighted
- Locked lessons: lock icon (click shows "Enroll to access")
- Right: video player

#### Resume Playback
- On load: frontend fetches `/api/progress/:lessonId` → gets `watchedSeconds`
- Plyr seeks to `watchedSeconds` on player ready
- "Continue Learning" card in dashboard uses `lastWatchedLesson` stored on enrollment

---

### 5.8 Search & Discovery

#### Search
- Navbar search input on all public pages
- On submit → `/courses?q=searchterm`
- Backend: MongoDB text index on `Course.title` and `Course.tags`
- Returns published courses matching query

#### Category Filter
- Categories: Frontend, Backend, Fullstack, Other
- Filter as query param: `/courses?category=Frontend`
- Multiple filters combinable: `/courses?q=react&category=Frontend`

#### Sorting
- Default: newest first (createdAt desc)
- Option: most popular (enrollment count desc)
- No price sorting (deprioritized)

---

## 6. Security Requirements

Security is an explicit evaluation criterion. Every item below must be implemented and explainable.

### Authentication Security
| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt, saltRounds: 12 |
| Access token | JWT, 15 min expiry, signed with RS256 or HS256 |
| Refresh token | JWT, 7 days, httpOnly + Secure + SameSite=Strict cookie |
| Token revocation | Redis blacklist (logout invalidates access token immediately) |
| Rate limiting on auth | 5 login attempts per 15 min per IP (express-rate-limit + Redis store) |

### API Security
| Measure | Implementation |
|---------|---------------|
| HTTP headers | Helmet.js (X-Frame-Options, X-Content-Type-Options, HSTS, CSP) |
| CORS | Configured whitelist of allowed origins (not `*`) |
| XSS prevention | Helmet CSP + DOMPurify on any user-rendered HTML |
| NoSQL injection | Mongoose schema validation + express-mongo-sanitize middleware |
| Input validation | Zod schemas on all API request bodies |
| Rate limiting | express-rate-limit on all public endpoints (100 req/15 min) |
| Payment webhook | HMAC-SHA256 signature verification before processing |

### Authorization Security
| Measure | Implementation |
|---------|---------------|
| Role-based access | `requireAuth` + `requireRole('admin')` Express middleware |
| Video access control | Server-side enrollment check before issuing signed URL |
| Admin routes | Double-checked: both frontend route guard + backend middleware |
| Content protection | Cloudinary signed URLs with 1-hour TTL (never expose raw URLs) |

### Data Security
| Measure | Implementation |
|---------|---------------|
| Env variables | All secrets in `.env`, never committed |
| MongoDB | No `$where` or raw query strings; Mongoose operators only |
| Sensitive fields | Password field excluded from all API responses (`select: false`) |

---

## 7. Cost Optimization Strategy

**Target:** Under ₹500/month for a functional production deployment.

| Service | Plan | Est. Monthly Cost | Notes |
|---------|------|-------------------|-------|
| Frontend (React) | Vercel Free | ₹0 | Unlimited deploys, CDN |
| Backend (Express) | Render Free or Railway Hobby | ₹0–₹350 | Render free tier spins down; Railway ~$5 |
| Database | MongoDB Atlas M0 (Free) | ₹0 | 512MB storage, enough for this |
| Redis | Upstash Free | ₹0 | 10k commands/day free |
| Video & Image Storage | Cloudinary Free | ₹0 | 25 GB storage, 25 GB bandwidth/month |
| Payment | Razorpay Test Mode | ₹0 | No cost in test mode |
| **Total** | | **₹0–₹350/mo** | |

**Trade-offs acknowledged:**
- Render free tier has cold starts (~30s spin-up). For a portfolio/submission project this is acceptable. Upgrade to paid tier for production traffic.
- Cloudinary free tier bandwidth (25GB/mo) is sufficient for a demo with limited users. HLS + R2 would be the upgrade path for scale.
- MongoDB Atlas M0 has no auto-scaling. Acceptable for v1 with seeded data and limited users.

**Cost Upgrade Path (post-v1):**
- Replace Cloudinary video with Cloudflare R2 + Stream (~$5/mo for storage, $1/1000 min viewed)
- Upgrade Render to Starter ($7/mo) to eliminate cold starts
- Upgrade MongoDB to M10 ($57/mo) for dedicated cluster

---

## 8. UI/UX Design Specification

### Design Language
**Inspired by:** ChaiCode.com  
**Theme:** Dark-first, light theme also supported (toggle in navbar)  
**Aesthetic:** Bold editorial, warm amber/orange accents on deep dark backgrounds

### Color Palette
```
Dark Theme:
  Background:     #0A0A0A  (near black)
  Surface:        #111111  (cards, panels)
  Border:         #1F1F1F
  Text Primary:   #FFFFFF
  Text Secondary: #A1A1AA  (zinc-400)
  Accent:         #F97316  (orange-500 — CTA buttons, highlights)
  Accent Hover:   #EA580C  (orange-600)

Light Theme:
  Background:     #FAFAFA
  Surface:        #FFFFFF
  Border:         #E4E4E7
  Text Primary:   #09090B
  Text Secondary: #71717A
  Accent:         #F97316
  Accent Hover:   #EA580C
```

### Typography
```
Display/Headings:   Inter (700–900 weight, tight tracking: -0.02em to -0.04em)
Body:               Inter (400–500 weight)
Code/Mono:          JetBrains Mono (for any code snippets in content)
```

### Component Patterns
- **Buttons:** Solid orange (primary), outline (secondary), ghost (tertiary)
- **Cards:** `bg-surface` with subtle border, rounded-xl, hover shadow
- **Inputs:** Dark background, zinc border, orange focus ring
- **Badges:** Pill shape, category color-coded
- **Progress bars:** Orange fill on dark track

### Layout
- **Navbar:** Fixed top, blur backdrop, logo left / nav center / actions right
- **Mobile:** Hamburger menu, bottom-sheet for filters
- **Grid:** 3-col courses on desktop, 2-col on tablet, 1-col on mobile
- **Admin:** Left sidebar + main content area

### Animations
- Page transitions: Framer Motion fade + slight upward slide (100ms)
- Card hover: subtle scale(1.02) + shadow lift
- Progress bar: smooth width transition on update
- Skeleton loaders for async content

---

## 9. API Overview

Base URL: `https://api.veolms.com/api` (or Render URL)

### Auth
```
POST   /auth/signup           Register user
POST   /auth/login            Login, returns tokens
POST   /auth/logout           Blacklist token, clear cookie
POST   /auth/refresh          Issue new access token from cookie
GET    /auth/me               Get current user profile
```

### Courses
```
GET    /courses               List published courses (with filters)
GET    /courses/:slug         Get single course with curriculum
POST   /courses               [Admin] Create course
PATCH  /courses/:id           [Admin] Update course
DELETE /courses/:id           [Admin] Delete course
PATCH  /courses/:id/publish   [Admin] Toggle publish status
```

### Sections & Lessons
```
POST   /courses/:id/sections              [Admin] Add section
PATCH  /sections/:sectionId               [Admin] Edit section
DELETE /sections/:sectionId               [Admin] Delete section
POST   /sections/:sectionId/lessons       [Admin] Add lesson
PATCH  /lessons/:lessonId                 [Admin] Edit lesson
DELETE /lessons/:lessonId                 [Admin] Delete lesson
GET    /lessons/:lessonId/video           [Auth + Enrolled] Get signed video URL
```

### Upload
```
POST   /upload/video          [Admin] Upload video to Cloudinary
POST   /upload/image          [Admin] Upload image to Cloudinary
```

### Payments
```
POST   /payments/create-order     [Student] Create Razorpay order
POST   /payments/verify           [Student] Verify payment signature
POST   /payments/webhook          [Public, Razorpay] Webhook handler
```

### Enrollment
```
GET    /enrollments/my            [Student] Get my enrollments
GET    /enrollments               [Admin] Get all enrollments
```

### Progress
```
GET    /progress/:lessonId        [Student] Get progress for lesson
POST   /progress                  [Student] Upsert progress
GET    /progress/course/:courseId [Student] Get all progress for a course
```

### Admin
```
GET    /admin/stats               Dashboard overview stats
GET    /admin/students            All students
GET    /admin/analytics           Revenue + enrollment charts
```

---

## 10. Deployment Strategy

### Architecture
```
[Browser] 
    ↓
[Vercel CDN] → React Frontend (Static)
    ↓
[Render/Railway] → Express API Server
    ↓
[MongoDB Atlas] ← Database
[Upstash Redis] ← Token blacklist + rate limiting
[Cloudinary]    ← Video + image storage
[Razorpay]      ← Payment processing
```

### Frontend — Vercel
- React app deployed to Vercel
- Environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`
- Automatic deploys on push to `main`

### Backend — Render (or Railway)
- Express app as a Web Service
- Environment variables set in Render dashboard:
  - `MONGODB_URI`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `REDIS_URL`
  - `ADMIN_SECRET_KEY`
  - `CLIENT_URL` (Vercel frontend URL, for CORS)

### Razorpay Webhook
- Razorpay dashboard → Webhooks → Add endpoint: `https://your-api.onrender.com/api/payments/webhook`
- Events: `payment.captured`

---

## 11. Seed Data Plan

### Courses to Seed
| Course | Sections | Lessons | Preview Lesson |
|--------|----------|---------|----------------|
| HTML Fundamentals | 3 | 6 | Lesson 1: What is HTML? |
| CSS Mastery | 3 | 6 | Lesson 1: What is CSS? |
| JavaScript Essentials | 4 | 8 | Lesson 1: Intro to JavaScript |
| React Complete Guide | 3 | 6 | Lesson 1: Why React? |
| Redux Toolkit | 2 | 5 | Lesson 1: State Management Concepts |

Videos: YouTube embed URLs from public channels (Hitesh Choudhary's public videos). Store as `videoUrl` in lesson — played via Plyr's YouTube provider OR re-uploaded to Cloudinary as MP4.

**Recommendation:** For v1, use YouTube oEmbed URLs for seeded courses (zero storage cost). For demo polish, upload 1–2 short MP4s to Cloudinary to demonstrate the signed URL flow.

### Admin Seed Account
```
Email:    admin@veolms.com
Password: Admin@123 (bcrypt hashed)
Role:     admin
```

### Student Seed Account
```
Email:    student@veolms.com
Password: Student@123 (bcrypt hashed)
Role:     student
```

---

## 12. Out of Scope (v1)

These features are NOT in scope for the submission but are noted for future reference:

- HLS streaming / multi-quality video (noted as bonus — implement after core is solid)
- Certificate generation on course completion
- Course reviews and ratings (data model ready, UI skipped)
- Coupon codes / discounts
- Instructor role (separate from Admin)
- Discussion forums / comments on lessons
- Email notifications (welcome email, enrollment confirmation)
- Live classes / cohorts
- Mobile app (separate teammate responsibility)
- Social login (Google OAuth)

---

## 13. Risks & Trade-offs

| Risk | Mitigation |
|------|-----------|
| Render free tier cold starts | Document the delay; upgrade to paid for real submission demo |
| Cloudinary bandwidth limits on video | Keep videos short for demo; note upgrade path to R2 in submission |
| Razorpay webhook delivery delay | Frontend verify endpoint as immediate fallback |
| MongoDB Atlas M0 connection limit | Connection pooling via Mongoose; maxPoolSize: 5 |
| JWT access token size | Keep payload minimal: `{ userId, role, iat, exp }` only |
| Video signed URL expiry UX | 1-hour TTL is enough for a session; refresh if lesson loads after expiry |
| Redis Upstash free tier limits | 10k commands/day is fine for demo traffic; each logout = 1 command |

---

## Appendix: Folder Structure Preview (for Step 4)

```
veolms/
├── client/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── app/               # Redux store
│   │   ├── components/        # Shared components
│   │   ├── features/          # Feature slices (auth, courses, etc.)
│   │   ├── pages/             # Route-level page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Axios instance, utils
│   │   └── types/             # TypeScript interfaces
│   └── vite.config.ts
│
└── server/                    # Express + TypeScript backend
    ├── src/
    │   ├── controllers/       # Route handlers
    │   ├── models/            # Mongoose models
    │   ├── routes/            # Express routers
    │   ├── middleware/        # Auth, rate limit, error handlers
    │   ├── services/          # Business logic (payments, uploads)
    │   ├── utils/             # JWT helpers, validators
    │   └── config/            # DB, Redis, Cloudinary setup
    └── tsconfig.json
```

---

*This PRD is the single source of truth for VeoLMS v1. Every architectural decision made during development should trace back to a requirement in this document. During the final interview, be prepared to explain any line in Section 3 (Tech Stack), Section 6 (Security), and Section 5.6 (Payment Flow) — these are the most likely interview focus areas.*
