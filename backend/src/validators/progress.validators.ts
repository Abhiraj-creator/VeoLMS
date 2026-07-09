import mongoose from 'mongoose'
import { z } from 'zod'

const objectIdSchema = z.string().refine((value) => mongoose.isValidObjectId(value), {
  message: 'Invalid ObjectId',
})

export const progressSchema = z
  .object({
    lessonId: objectIdSchema,
    courseId: objectIdSchema,
    watchedSeconds: z.number().min(0),
    totalSeconds: z.number().min(1),
  })
  .refine((data) => data.watchedSeconds <= data.totalSeconds, {
    message: 'Watched seconds cannot exceed total seconds',
    path: ['watchedSeconds'],
  })

export type ProgressInput = z.infer<typeof progressSchema>
