import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { config } from '../config/config'

// ─────────────────────────────────────────────
// AppError base class and subclasses
// ─────────────────────────────────────────────

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public errors?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden — insufficient permissions') {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409)
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 400, errors)
  }
}

// ─────────────────────────────────────────────
// Global error handler middleware
// ─────────────────────────────────────────────

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = config.NODE_ENV === 'development'

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(isDev && { stack: err.stack }),
    })
    return
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    })
    return
  }

  // Handle MongoDB duplicate key errors
  if ((err as NodeJS.ErrnoException).code === '11000' || (err as {code?: number}).code === 11000) {
    const keyPattern = (err as {keyPattern?: Record<string, unknown>}).keyPattern
    const field = keyPattern ? Object.keys(keyPattern)[0] : 'field'
    res.status(409).json({
      success: false,
      message: `Duplicate value: ${field ?? 'field'} already exists`,
    })
    return
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    })
    return
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    })
    return
  }

  // Unknown / unexpected errors — never leak in production
  console.error('❌ Unexpected error:', err)
  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  })
}
