import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from './errorHandler.middleware'

/**
 * Middleware factory — validates req.body against the given Zod schema.
 * On success: attaches cleaned/coerced data back to req.body.
 * On failure: throws ValidationError with field-level errors.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return next(new ValidationError('Validation failed', errors))
    }

    req.body = result.data
    next()
  }
}
