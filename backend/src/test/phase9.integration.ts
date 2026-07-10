import dotenv from 'dotenv'
dotenv.config()

import crypto from 'crypto'
import http from 'http'
import { Writable } from 'stream'
import mongoose from 'mongoose'

type TestStatus = 'PASS' | 'FAIL' | 'INFO'

interface TestResult {
  name: string
  status: TestStatus
  detail?: string
}

const results: TestResult[] = []

function record(name: string, status: TestStatus, detail?: string): void {
  results.push({ name, status, detail })
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function buildTestMongoUri(uri: string): string {
  const testDbName = `veolms_phase9_${Date.now()}`
  const queryIndex = uri.indexOf('?')
  const base = queryIndex >= 0 ? uri.slice(0, queryIndex) : uri
  const query = queryIndex >= 0 ? uri.slice(queryIndex) : ''
  const slashIndex = base.lastIndexOf('/')

  if (slashIndex < 'mongodb://'.length) {
    return `${base}/${testDbName}${query}`
  }

  return `${base.slice(0, slashIndex + 1)}${testDbName}${query}`
}

async function api<T = any>(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: T; headers: Headers }> {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  return { status: response.status, body, headers: response.headers }
}

function json(body: unknown, token?: string): RequestInit {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }
}

async function runCase(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    record(name, 'PASS')
  } catch (error) {
    record(name, 'FAIL', error instanceof Error ? error.message : String(error))
  }
}

async function main() {
  const originalMongoUri = process.env.MONGODB_URI
  expect(originalMongoUri, 'MONGODB_URI is required')
  process.env.NODE_ENV = 'test'
  process.env.MONGODB_URI = buildTestMongoUri(originalMongoUri)

  const { connectDatabase, disconnectDatabase } = await import('../config/database')
  const { connectRedis, getRedisClient } = await import('../config/redis')
  const { cloudinary } = await import('../config/cloudinary')
  const { razorpay } = await import('../config/razorpay')

  ;(cloudinary.uploader.upload_stream as unknown) = (
    options: { resource_type?: string; folder?: string },
    callback: (error: Error | undefined, result?: Record<string, unknown>) => void
  ) => {
    const chunks: Buffer[] = []
    return new Writable({
      write(chunk, _encoding, done) {
        chunks.push(Buffer.from(chunk))
        done()
      },
      final(done) {
        const publicId = `${options.folder}/phase9-${Date.now()}`
        callback(undefined, {
          secure_url: `https://res.cloudinary.com/test/${publicId}`,
          public_id: publicId,
          format: options.resource_type === 'video' ? 'mp4' : 'png',
          bytes: Buffer.concat(chunks).length,
          duration: options.resource_type === 'video' ? 120 : undefined,
        })
        done()
      },
    })
  }

  ;(razorpay.orders.create as unknown) = async (options: { amount: number; currency: string }) => ({
    id: `order_phase9_${Date.now()}`,
    amount: options.amount,
    currency: options.currency,
  })

  const app = (await import('../app')).default

  await connectDatabase()
  await connectRedis()

  const server = http.createServer(app)
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const address = server.address()
  expect(address && typeof address === 'object', 'Server address was not available')
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`

  let adminToken = ''
  let studentToken = ''
  let courseId = ''
  let sectionId = ''
  let lessonId = ''
  let previewLessonId = ''
  let orderId = ''

  await runCase('health endpoint reports API status', async () => {
    const res = await api(baseUrl, '/health')
    expect(res.status === 200, `expected 200, got ${res.status}`)
    expect((res.body as any).status === 'ok', 'health response did not include ok status')
  })

  await runCase('auth signup creates admin and student', async () => {
    const admin = await api(baseUrl, '/auth/signup', json({
      name: 'Phase Admin',
      email: 'phase-admin@example.com',
      password: 'Admin@123',
      adminKey: process.env.ADMIN_SECRET_KEY,
    }))
    expect(admin.status === 201, `admin signup expected 201, got ${admin.status}`)
    adminToken = (admin.body as any).data.accessToken

    const student = await api(baseUrl, '/auth/signup', json({
      name: 'Phase Student',
      email: 'phase-student@example.com',
      password: 'Student@123',
    }))
    expect(student.status === 201, `student signup expected 201, got ${student.status}`)
    studentToken = (student.body as any).data.accessToken
  })

  await runCase('auth rejects duplicate signup and missing token', async () => {
    const duplicate = await api(baseUrl, '/auth/signup', json({
      name: 'Phase Student',
      email: 'phase-student@example.com',
      password: 'Student@123',
    }))
    expect(duplicate.status === 409, `duplicate signup expected 409, got ${duplicate.status}`)

    const me = await api(baseUrl, '/auth/me')
    expect(me.status === 401, `missing auth expected 401, got ${me.status}`)
  })

  await runCase('course CRUD with JSON body', async () => {
    const created = await api(baseUrl, '/courses', json({
      title: 'Phase 9 CSS',
      slug: 'phase-9-css',
      description: 'Phase 9 integration course for CSS foundations.',
      price: 499,
      isPublished: true,
      tags: ['css', 'phase9'],
    }, adminToken))
    expect(created.status === 201, `course create expected 201, got ${created.status}`)
    courseId = (created.body as any).data.course._id

    const listed = await api(baseUrl, '/courses', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(listed.status === 200, `course list expected 200, got ${listed.status}`)
  })

  await runCase('course create rejects non-admin user', async () => {
    const res = await api(baseUrl, '/courses', json({
      title: 'Student Course',
      slug: 'student-course',
      description: 'Should not be allowed.',
    }, studentToken))
    expect(res.status === 401, `student course create expected 401, got ${res.status}`)
  })

  await runCase('image upload endpoint accepts multipart file', async () => {
    const form = new FormData()
    form.append('image', new Blob([Buffer.from('png-data')], { type: 'image/png' }), 'phase.png')
    const res = await api(baseUrl, '/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: form,
    })
    expect(res.status === 200, `image upload expected 200, got ${res.status}`)
    expect(Boolean((res.body as any).data.url), 'image upload did not return url')
  })

  await runCase('sections and lessons CRUD create ordered content', async () => {
    const section = await api(baseUrl, '/sections', json({
      courseId,
      title: 'Phase Section',
      order: 1,
      isPublished: true,
    }, adminToken))
    expect(section.status === 201, `section create expected 201, got ${section.status}`)
    sectionId = (section.body as any).data.section._id

    const lesson = await api(baseUrl, '/lessons', json({
      sectionId,
      title: 'Phase Lesson',
      content: 'Lesson content for Phase 9.',
      videoUrl: 'https://youtu.be/1dWQssiqKvQ',
      order: 1,
      duration: 100,
      isPublished: true,
    }, adminToken))
    expect(lesson.status === 201, `lesson create expected 201, got ${lesson.status}`)
    lessonId = (lesson.body as any).data.lesson._id

    const previewLesson = await api(baseUrl, '/lessons', json({
      sectionId,
      title: 'Preview Lesson',
      content: 'Preview lesson content for Phase 9.',
      videoUrl: 'https://youtu.be/1dWQssiqKvQ',
      order: 3,
      duration: 80,
      isPreview: true,
      isPublished: true,
    }, adminToken))
    expect(previewLesson.status === 201, `preview lesson create expected 201, got ${previewLesson.status}`)
    previewLessonId = (previewLesson.body as any).data.lesson._id
  })

  await runCase('lesson video upload through lesson create multipart', async () => {
    const form = new FormData()
    form.append('sectionId', sectionId)
    form.append('title', 'Uploaded Video Lesson')
    form.append('content', 'Lesson with uploaded video.')
    form.append('order', '2')
    form.append('isPublished', 'true')
    form.append('video', new Blob([Buffer.from('video-data')], { type: 'video/mp4' }), 'lesson.mp4')
    const res = await api(baseUrl, '/lessons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: form,
    })
    expect(res.status === 201, `multipart lesson create expected 201, got ${res.status}`)
    expect(Boolean((res.body as any).data.lesson.videoUrl), 'lesson did not store uploaded videoUrl')
  })

  await runCase('course slug detail returns curriculum without raw video URLs', async () => {
    const res = await api(baseUrl, '/courses/phase-9-css')
    expect(res.status === 200, `slug detail expected 200, got ${res.status}`)
    const curriculum = (res.body as any).data.curriculum
    expect(Array.isArray(curriculum), 'curriculum should be an array')
    const firstLesson = curriculum[0].lessons[0]
    expect(!('videoUrl' in firstLesson), 'curriculum leaked videoUrl')
    expect(!('cloudinaryPublicId' in firstLesson), 'curriculum leaked cloudinaryPublicId')
  })

  await runCase('video endpoint allows preview and protects locked lessons before enrollment', async () => {
    const preview = await api(baseUrl, `/courses/phase-9-css/video?lessonId=${previewLessonId}`)
    expect(preview.status === 200, `preview video expected 200, got ${preview.status}`)
    expect(Boolean((preview.body as any).data.videoUrl), 'preview video did not return videoUrl')

    const locked = await api(baseUrl, `/courses/phase-9-css/video?lessonId=${lessonId}`)
    expect(locked.status === 401, `locked video without auth expected 401, got ${locked.status}`)
  })

  await runCase('payment create order and duplicate pending protection', async () => {
    const created = await api(baseUrl, '/payments/create-order', json({ courseId }, studentToken))
    expect(created.status === 201, `create-order expected 201, got ${created.status}`)
    orderId = (created.body as any).data.order.orderId

    const duplicate = await api(baseUrl, '/payments/create-order', json({ courseId }, studentToken))
    expect(duplicate.status === 409, `duplicate pending expected 409, got ${duplicate.status}`)
  })

  await runCase('payment verify completes enrollment and rejects bad signature', async () => {
    const bad = await api(baseUrl, '/payments/verify', json({
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_phase9_bad',
      razorpaySignature: 'bad-signature',
    }, studentToken))
    expect(bad.status === 400, `bad signature expected 400, got ${bad.status}`)

    const paymentId = 'pay_phase9_ok'
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    const verified = await api(baseUrl, '/payments/verify', json({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    }, studentToken))
    expect(verified.status === 200, `verify expected 200, got ${verified.status}`)
  })

  await runCase('enrollments and progress endpoints work for enrolled student', async () => {
    const my = await api(baseUrl, '/enrollments/my', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(my.status === 200, `my enrollments expected 200, got ${my.status}`)
    expect((my.body as any).data.enrollments.length === 1, 'expected one completed enrollment')

    const progress = await api(baseUrl, '/progress', json({
      lessonId,
      courseId,
      watchedSeconds: 90,
      totalSeconds: 100,
    }, studentToken))
    expect(progress.status === 200, `save progress expected 200, got ${progress.status}`)
    expect((progress.body as any).data.progress.completed === true, 'progress should be completed at 90%')

    const resume = await api(baseUrl, `/progress/${lessonId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(resume.status === 200, `get progress expected 200, got ${resume.status}`)
  })

  await runCase('video endpoint allows locked lessons for enrolled student', async () => {
    const res = await api(baseUrl, `/courses/phase-9-css/video?lessonId=${lessonId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(res.status === 200, `enrolled locked video expected 200, got ${res.status}`)
    expect(Boolean((res.body as any).data.videoUrl), 'enrolled video did not return videoUrl')
  })

  await runCase('admin stats analytics and enrollment listing work', async () => {
    const stats = await api(baseUrl, '/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(stats.status === 200, `admin stats expected 200, got ${stats.status}`)
    expect((stats.body as any).data.stats.totalCourses >= 1, 'admin stats totalCourses missing')

    const analytics = await api(baseUrl, '/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(analytics.status === 200, `admin analytics expected 200, got ${analytics.status}`)

    const allEnrollments = await api(baseUrl, '/enrollments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(allEnrollments.status === 200, `admin enrollments expected 200, got ${allEnrollments.status}`)
  })

  await new Promise<void>((resolve) => server.close(() => resolve()))
  await mongoose.connection.dropDatabase()
  await disconnectDatabase()
  await getRedisClient().quit()

  const failed = results.filter((result) => result.status === 'FAIL')
  const summary = {
    passed: results.filter((result) => result.status === 'PASS').length,
    failed: failed.length,
    info: results.filter((result) => result.status === 'INFO').length,
    results,
  }

  console.log(JSON.stringify(summary, null, 2))
  if (failed.length > 0) {
    process.exit(1)
  }
}

main().catch(async (error) => {
  record('test runner fatal error', 'FAIL', error instanceof Error ? error.message : String(error))
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase()
      await mongoose.disconnect()
    }
  } catch {
    // best-effort cleanup
  }
  console.log(JSON.stringify({
    passed: results.filter((result) => result.status === 'PASS').length,
    failed: results.filter((result) => result.status === 'FAIL').length,
    info: results.filter((result) => result.status === 'INFO').length,
    results,
  }, null, 2))
  process.exit(1)
})
