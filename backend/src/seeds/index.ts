import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database'
import { connectRedis, getRedisClient } from '../config/redis'
import { CourseDAO } from '../Dao/course.dao'
import { UserDAO } from '../Dao/user.dao'
import { Course } from '../models/course.model'
import { Lesson } from '../models/lesson.model'
import { Section } from '../models/section.model'
import { coursesData } from './data/courses.data'

async function ensureUser(data: {
  name: string
  email: string
  passwordHash: string
  role?: 'student' | 'admin'
}) {
  const existing = await UserDAO.findByEmail(data.email)
  return existing ?? UserDAO.create(data)
}

async function removeSeedCourse(slug: string) {
  const existing = await Course.findOne({ slug }).exec()
  if (!existing) return

  const sections = await Section.find({ courseId: existing._id }).select('_id').exec()
  await Lesson.deleteMany({ sectionId: { $in: sections.map((section) => section._id) } }).exec()
  await Section.deleteMany({ courseId: existing._id }).exec()
  await Course.deleteOne({ _id: existing._id }).exec()
}

async function seed() {
  const fresh = process.argv.includes('--fresh')

  await connectDatabase()
  await connectRedis()

  if (fresh) {
    await mongoose.connection.dropDatabase()
    console.log('Dropped existing database')
  }

  const admin = await ensureUser({
    name: 'Admin',
    email: 'admin@veolms.com',
    passwordHash: 'Admin@123',
    role: 'admin',
  })

  await ensureUser({
    name: 'Student',
    email: 'student@veolms.com',
    passwordHash: 'Student@123',
    role: 'student',
  })

  for (const courseData of coursesData) {
    await removeSeedCourse(courseData.slug)

    const course = await CourseDAO.create({
      title: courseData.title,
      slug: courseData.slug,
      category: courseData.category,
      shortDescription: courseData.shortDescription,
      description: courseData.description,
      thumbnailUrl: courseData.thumbnailUrl,
      price: courseData.price,
      tags: courseData.tags,
      isPublished: true,
      createdBy: admin._id,
    })

    let lessonCount = 0
    for (const sectionData of courseData.sections) {
      const section = await Section.create({
        courseId: course._id,
        title: sectionData.title,
        order: sectionData.order,
        isPublished: true,
      })

      for (const lessonData of sectionData.lessons) {
        await Lesson.create({
          sectionId: section._id,
          title: lessonData.title,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl,
          cloudinaryPublicId: lessonData.cloudinaryPublicId,
          duration: lessonData.duration,
          order: lessonData.order,
          isPreview: lessonData.isPreview,
          isPublished: true,
        })
        lessonCount += 1
      }
    }

    await CourseDAO.updateCache(course._id)
    console.log(`Created course: ${courseData.title} (${lessonCount} lessons)`)
  }
}

seed()
  .then(async () => {
    await disconnectDatabase()
    await getRedisClient().quit()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('Seed failed:', error)
    await disconnectDatabase()
    await getRedisClient().quit()
    process.exit(1)
  })
