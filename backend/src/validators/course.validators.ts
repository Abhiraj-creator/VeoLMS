import { z } from 'zod'

function booleanFromFormData(schema: z.ZodType<boolean | undefined>) {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true
      if (value.toLowerCase() === 'false') return false
    }
    return value
  }, schema)
}

function numberFromFormData(schema: z.ZodType<number>) {
  return z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      return Number.isNaN(parsed) ? value : parsed
    }
    return value
  }, schema)
}

const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(140, 'Slug must be at most 140 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers, and hyphens')

export const  createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120).trim(),
  slug: slugSchema,
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional().nullable(),
  thumbnailPublicId: z.string().min(1).optional().nullable(),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(120).trim().optional(),
  slug: slugSchema.optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional().nullable(),
  thumbnailPublicId: z.string().min(1).optional().nullable(),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export const createSectionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120).trim(),
  order: numberFromFormData(z.number().int().positive()),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export const updateSectionSchema = z.object({
  title: z.string().min(2).max(120).trim().optional(),
  order: numberFromFormData(z.number().int().positive()).optional(),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export const createLessonSchema = z.object({
  sectionId: z.string().min(1, 'Section ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120).trim(),
  content: z.string().min(1, 'Content is required').max(10000).trim(),
  videoUrl: z.string().url('Video URL must be a valid URL').optional().nullable(),
  cloudinaryPublicId: z.string().min(1).optional().nullable(),
  order: numberFromFormData(z.number().int().positive()),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export const updateLessonSchema = z.object({
  title: z.string().min(2).max(120).trim().optional(),
  content: z.string().min(1).max(10000).trim().optional(),
  videoUrl: z.string().url('Video URL must be a valid URL').optional().nullable(),
  cloudinaryPublicId: z.string().min(1).optional().nullable(),
  order: numberFromFormData(z.number().int().positive()).optional(),
  isPublished: booleanFromFormData(z.boolean().optional()),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
