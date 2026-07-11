import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { ICourse, ICourseDetail } from '../../../types/course.types'

export interface CourseFilters {
  q?: string
  category?: string
  page?: number
  limit?: number
  sort?: string
}

interface CoursesResponse {
  courses: ICourse[]
  total: number
  page: number
  limit: number
}

function toQueryString(filters: CourseFilters = {}): string {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const coursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<CoursesResponse, CourseFilters | void>({
      query: (filters) => ({
        url: `/courses${toQueryString(filters ?? {})}`,
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<CoursesResponse>) => response.data!,
      providesTags: ['Course'],
    }),
    getCourseBySlug: builder.query<ICourseDetail, string>({
      query: (slug) => ({
        url: `/courses/${slug}`,
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<ICourseDetail>) => response.data!,
      providesTags: ['Course'],
    }),
  }),
})

export const { useGetCoursesQuery, useGetCourseBySlugQuery } = coursesApi
