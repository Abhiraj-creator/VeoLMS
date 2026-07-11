import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { IEnrollment } from '../../../types/enrollment.types'

interface MyEnrollmentsResponse {
  enrollments: IEnrollment[]
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
  }),
})

export const { useGetMyEnrollmentsQuery } = enrollmentApi
