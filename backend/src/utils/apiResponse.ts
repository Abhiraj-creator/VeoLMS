import { Response } from 'express'
import { APIResponse, PaginatedResult } from '../types/common.types'

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  const response: APIResponse<T> = {
    success: true,
    message,
    data,
  }
  res.status(statusCode).json(response)
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
): void {
  const totalPages = Math.ceil(total / limit)
  const result: PaginatedResult<T> = {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }

  const response: APIResponse<PaginatedResult<T>> = {
    success: true,
    message,
    data: result,
  }
  res.status(200).json(response)
}
