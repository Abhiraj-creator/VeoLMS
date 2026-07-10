import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { IUser } from '../../../types/user.types'

interface AuthPayload {
  user: IUser
  accessToken: string
}

interface LoginInput {
  email: string
  password: string
}

interface SignupInput extends LoginInput {
  name: string
  adminKey?: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthPayload, SignupInput>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
      transformResponse: (response: APIResponse<AuthPayload>) => response.data,
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<AuthPayload, LoginInput>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: APIResponse<AuthPayload>) => response.data,
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: ['User'],
    }),
    refresh: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      transformResponse: (response: APIResponse<{ accessToken: string }>) => response.data,
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<IUser, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<{ user: IUser }>) => response.data.user,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<IUser, Partial<Pick<IUser, 'name' | 'avatar'>>>({
      query: (body) => ({
        url: '/auth/update-profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: APIResponse<{ user: IUser }>) => response.data.user,
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
} = authApi
