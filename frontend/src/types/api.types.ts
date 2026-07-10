export interface APIResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]> | string[] | null
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}
