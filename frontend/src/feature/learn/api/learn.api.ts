import { baseApi } from '../../../shared/state/baseApi'
import type { APIResponse } from '../../../types/api.types'
import type { IProgress, ICourseProgress } from '../../../types/progress.types'

export interface SaveProgressRequest {
  lessonId: string
  courseId: string
  watchedSeconds: number
  totalSeconds: number
}

export interface SaveProgressResponse {
  watchedSeconds: number
  totalSeconds: number
  completed: boolean
  progressPercent: number
}

export interface LessonVideoResponse {
  videoUrl: string
  expiresInSeconds: number | null
  lesson: {
    _id: string
    title: string
    duration: number
    isPreview: boolean
  }
}

export const learnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonVideo: builder.query<LessonVideoResponse, { courseSlug: string; lessonId: string }>({
      query: ({ courseSlug, lessonId }) => ({
        url: `/courses/${courseSlug}/video`,
        method: 'GET',
        params: { lessonId },
      }),
      transformResponse: (response: APIResponse<LessonVideoResponse>) => response.data!,
    }),
    saveProgress: builder.mutation<SaveProgressResponse, SaveProgressRequest>({
      query: (body) => ({
        url: '/progress',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Progress', 'Enrollment'],
    }),
    getCourseProgress: builder.query<ICourseProgress[], string>({
      query: (courseId) => ({
        url: `/progress/course/${courseId}`,
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<ICourseProgress[]>) => response.data!,
      providesTags: ['Progress'],
    }),
    getLessonProgress: builder.query<IProgress, string>({
      query: (lessonId) => ({
        url: `/progress/${lessonId}`,
        method: 'GET',
      }),
      transformResponse: (response: APIResponse<IProgress>) => response.data!,
      providesTags: ['Progress'],
    }),
  }),
})

export const {
  useGetLessonVideoQuery,
  useLazyGetLessonVideoQuery,
  useSaveProgressMutation,
  useGetCourseProgressQuery,
  useGetLessonProgressQuery,
} = learnApi
