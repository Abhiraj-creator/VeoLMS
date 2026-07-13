import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { IEnrollment } from '../../../types/enrollment.types'

interface MyEnrollmentsResponse {
  enrollments: IEnrollment[]
}

// Populated shape returned by /enrollments/my/recent
export interface IRecentProgress {
  _id: string
  lesson: { _id: string; title: string; order: number }
  course: { _id: string; title: string; slug: string; thumbnailUrl: string | null }
  watchedSeconds: number
  totalSeconds: number
  completed: boolean
  lastWatchedAt: string
}

export const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyEnrollments: builder.query<IEnrollment[], void>({
      query: () => ({
        url: '/enrollments/my',
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<MyEnrollmentsResponse>) => response.data!.enrollments,
      providesTags: ['Enrollment'],
    }),
    getRecentProgress: builder.query<IRecentProgress[], void>({
      query: () => ({
        url: '/enrollments/my/recent',
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<{ recentProgress: IRecentProgress[] }>) =>
        response.data!.recentProgress,
      providesTags: ['Progress'],
    }),
  }),
})

export const { useGetMyEnrollmentsQuery, useGetRecentProgressQuery } = enrollmentApi
