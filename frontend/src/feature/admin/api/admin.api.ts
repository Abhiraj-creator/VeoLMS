import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { ICourse } from '../../../types/course.types'
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
  category: ICourse['category']
  shortDescription: string
  description: string
  price: number
  tags?: string[]
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Stats
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({ url: '/admin/stats', method: 'GET' }),
      transformResponse: (res: APIResponse<AdminStats>) => res.data!,
      providesTags: ['Admin'],
    }),

    // Analytics
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      query: () => ({ url: '/admin/analytics', method: 'GET' }),
      transformResponse: (res: APIResponse<AdminAnalytics>) => res.data!,
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
      transformResponse: (res: APIResponse<IEnrollment[]>) => res.data!,
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
} = adminApi
