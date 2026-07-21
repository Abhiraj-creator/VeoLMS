import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { ICourse, ISection, ILesson } from '../../../types/course.types'
import type { IEnrollment } from '../../../types/enrollment.types'
import type { IUser } from '../../../types/user.types'

// ─── Response Types ────────────────────────────────────────────────────────────

export interface AdminStats {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  totalRevenue: number
  recentEnrollments: Array<{
    _id: string
    student: Pick<IUser, '_id' | 'name' | 'email'>
    course: Pick<ICourse, '_id' | 'title' | 'thumbnailUrl'>
    amount: number
    enrolledAt: string
  }>
}

export interface RevenuePerCourse {
  _id: string
  courseTitle: string
  totalRevenue: number
  enrollments: number
}

export interface EnrollmentByDay {
  date: string
  count: number
}

export interface AdminAnalytics {
  revenuePerCourse: RevenuePerCourse[]
  enrollmentsByDay: EnrollmentByDay[]
}

export interface StudentsResponse {
  students: IUser[]
  total: number
  page: number
  limit: number
}

export interface CreateCoursePayload {
  title: string
  slug: string
  category: ICourse['category']
  shortDescription: string
  description: string
  price: number
  tags?: string[]
  thumbnailUrl?: string | null
  thumbnailPublicId?: string | null
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>

export interface CreateSectionPayload {
  courseId: string
  title: string
  order: number
  isPublished?: boolean
}

export interface UpdateSectionPayload {
  title?: string
  order?: number
  isPublished?: boolean
}

export interface CreateLessonPayload {
  sectionId: string
  title: string
  content: string
  videoUrl?: string | null
  cloudinaryPublicId?: string | null
  duration?: number
  order: number
  isPreview?: boolean
  isPublished?: boolean
}

export interface UpdateLessonPayload {
  title?: string
  content?: string
  videoUrl?: string | null
  cloudinaryPublicId?: string | null
  duration?: number
  order?: number
  isPreview?: boolean
  isPublished?: boolean
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Stats
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({ url: '/admin/stats', method: 'GET' }),
      transformResponse: (res: APIResponse<{ stats: AdminStats }>) => res.data!.stats,
      providesTags: ['Admin'],
    }),

    // Analytics
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      query: () => ({ url: '/admin/analytics', method: 'GET' }),
      transformResponse: (
        res: APIResponse<{
          analytics: {
            revenuePerCourse: Array<{
              courseId: string
              title: string
              revenue: number
              enrollments: number
            }>
            enrollmentsByDay: Array<{ date: string; enrollments: number }>
          }
        }>
      ) => {
        const { analytics } = res.data!
        return {
          revenuePerCourse: analytics.revenuePerCourse.map((item) => ({
            _id: item.courseId,
            courseTitle: item.title,
            totalRevenue: item.revenue,
            enrollments: item.enrollments,
          })),
          enrollmentsByDay: analytics.enrollmentsByDay.map((item) => ({
            date: item.date,
            count: item.enrollments,
          })),
        }
      },
      providesTags: ['Admin'],
    }),

    // Students
    getAdminStudents: builder.query<StudentsResponse, { q?: string; page?: number }>({
      query: ({ q, page } = {}) => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (page) params.set('page', String(page))
        const qs = params.toString()
        return { url: `/admin/students${qs ? `?${qs}` : ''}`, method: 'GET' }
      },
      transformResponse: (res: APIResponse<StudentsResponse>) => res.data!,
      providesTags: ['Admin'],
    }),

    // Student enrollments
    getStudentEnrollments: builder.query<IEnrollment[], string>({
      query: (studentId) => ({ url: `/admin/students/${studentId}/enrollments`, method: 'GET' }),
      transformResponse: (res: APIResponse<{ enrollments: IEnrollment[] }>) => res.data!.enrollments,
      providesTags: ['Admin'],
    }),

    // Course mutations
    createCourse: builder.mutation<ICourse, CreateCoursePayload>({
      query: (body) => ({ url: '/courses', method: 'POST', body }),
      transformResponse: (res: APIResponse<{ course: ICourse }>) => res.data!.course,
      invalidatesTags: ['Course', 'Admin'],
    }),

    updateCourse: builder.mutation<ICourse, { id: string; data: UpdateCoursePayload }>({
      query: ({ id, data }) => ({ url: `/courses/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: APIResponse<{ course: ICourse }>) => res.data!.course,
      invalidatesTags: ['Course', 'Admin'],
    }),

    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({ url: `/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Course', 'Admin'],
    }),

    togglePublishCourse: builder.mutation<ICourse, string>({
      query: (id) => ({ url: `/courses/${id}/publish`, method: 'PATCH' }),
      transformResponse: (res: APIResponse<{ course: ICourse }>) => res.data!.course,
      invalidatesTags: ['Course', 'Admin'],
    }),

    // Section mutations
    createSection: builder.mutation<ISection, CreateSectionPayload>({
      query: (body) => ({ url: '/sections', method: 'POST', body }),
      transformResponse: (res: APIResponse<{ section: ISection }>) => res.data!.section,
      invalidatesTags: ['Course'],
    }),

    updateSection: builder.mutation<ISection, { sectionId: string; data: UpdateSectionPayload }>({
      query: ({ sectionId, data }) => ({ url: `/sections/${sectionId}`, method: 'PATCH', body: data }),
      transformResponse: (res: APIResponse<{ section: ISection }>) => res.data!.section,
      invalidatesTags: ['Course'],
    }),

    deleteSection: builder.mutation<void, string>({
      query: (sectionId) => ({ url: `/sections/${sectionId}`, method: 'DELETE' }),
      invalidatesTags: ['Course'],
    }),

    // Lesson mutations
    createLesson: builder.mutation<ILesson, CreateLessonPayload>({
      query: (body) => ({ url: '/lessons', method: 'POST', body }),
      transformResponse: (res: APIResponse<{ lesson: ILesson }>) => res.data!.lesson,
      invalidatesTags: ['Course'],
    }),

    updateLesson: builder.mutation<ILesson, { lessonId: string; data: UpdateLessonPayload }>({
      query: ({ lessonId, data }) => ({ url: `/lessons/${lessonId}`, method: 'PATCH', body: data }),
      transformResponse: (res: APIResponse<{ lesson: ILesson }>) => res.data!.lesson,
      invalidatesTags: ['Course'],
    }),

    deleteLesson: builder.mutation<void, string>({
      query: (lessonId) => ({ url: `/lessons/${lessonId}`, method: 'DELETE' }),
      invalidatesTags: ['Course'],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminStudentsQuery,
  useGetStudentEnrollmentsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useTogglePublishCourseMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} = adminApi
