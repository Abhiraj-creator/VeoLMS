import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../../constants/api'
import { logout, setCredentials } from '../../feature/auth/state/auth.slice'
import { store } from '../../app/app.store'
import type { IUser } from '../../types/user.types'

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshResponse = await refreshClient.post('/auth/refresh')
      const accessToken = refreshResponse.data?.data?.accessToken as string | undefined

      if (!accessToken) {
        throw new Error('Refresh response did not include an access token')
      }

      const user = store.getState().auth.user as IUser | null
      store.dispatch(setCredentials({ user, accessToken }))

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      store.dispatch(logout())

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }

      return Promise.reject(refreshError)
    }
  }
)
