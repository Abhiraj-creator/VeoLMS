import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { redis } from '../config/redis'
import { verifyAccessToken } from '../utils/jwt.utils'
import { UnauthorizedError, ForbiddenError } from './errorHandler.middleware'

/**
 * requireAuth — extracts a Bearer token only, checks Redis blacklist, verifies JWT,
 * attaches req.user = { _id, role }
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      throw new UnauthorizedError('No authentication token provided')
    }

    // Check Redis blacklist
    const isBlacklisted = await redis.get(`bl_${token}`)
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked')
    }

    // Verify JWT
    const payload = verifyAccessToken(token)

    req.user = {
      _id: new mongoose.Types.ObjectId(payload.userId),
      role: payload.role,
    }

    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error)
    } else if ((error as Error).name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'))
    } else if ((error as Error).name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'))
    } else {
      next(error)
    }
  }
}

/**
 * requireRole — checks req.user.role against the required role.
 * Must be used after requireAuth.
 */
export function requireRole(role: 'student' | 'admin') {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const req = _req
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }
    if (req.user.role !== role) {
      return next(new ForbiddenError(`This action requires ${role} role`))
    }
    next()
  }
}

/**
 * optionalAuth — same as requireAuth but calls next() even without a valid token.
 * Attaches req.user if token is present and valid.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const cookieToken = req.cookies?.accessToken as string | undefined
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken
    if (!token) {
      return next() // No token — proceed without user
    }
    const isBlacklisted = await redis.get(`bl_${token}`)
    if (isBlacklisted) {
      return next() // Blacklisted — treat as unauthenticated
    }

    const payload = verifyAccessToken(token)
    req.user = {
      _id: new mongoose.Types.ObjectId(payload.userId),
      role: payload.role,
    }
  } catch {
    // Invalid token — proceed without user
  }
  next()
}
