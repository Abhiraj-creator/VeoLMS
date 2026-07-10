import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../../constants/api'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth?: { accessToken?: string | null } }).auth?.accessToken

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['User', 'Course', 'Enrollment', 'Progress', 'Admin'],
  endpoints: () => ({}),
})
