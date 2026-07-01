import { Response } from 'express'
import { UserDAO } from '../Dao/user.dao'
import { redis } from '../config/redis'
import { config } from '../config/config'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenTTL,
} from '../utils/jwt.utils'
import {
  AppError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../middleware/errorHandler.middleware'
import { IUser } from '../models/user.model'

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
}

function setAccessCookie(res: Response, token: string): void {
  res.cookie('accessToken', token, ACCESS_COOKIE_OPTIONS)
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS)
}

function clearAccessCookie(res: Response): void {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResult {
  user: Omit<IUser, 'passwordHash'>
  accessToken: string
}

export class AuthService {
  static async signup(
    name: string,
    email: string,
    password: string,
    adminKey?: string,
    res?: Response
  ): Promise<AuthResult> {
    // Check uniqueness
    const existing = await UserDAO.findByEmail(email)
    if (existing) {
      throw new ConflictError('An account with this email already exists')
    }

    // Determine role
    const role = adminKey === config.ADMIN_SECRET_KEY ? 'admin' : 'student'

    // Create user (passwordHash field triggers bcrypt pre-save hook)
    const user = await UserDAO.create({ name, email, passwordHash: password, role })

    // Sign tokens
    const accessToken = signAccessToken(user._id, user.role)
    const refreshToken = signRefreshToken(user._id)

    if (res) {
      setAccessCookie(res, accessToken)
      setRefreshCookie(res, refreshToken)
    }

    const userObj = user.toObject() as Omit<IUser, 'passwordHash'>
    return { user: userObj, accessToken }
  }

  static async login(
    email: string,
    password: string,
    res?: Response
  ): Promise<AuthResult> {
    // Anti-enumeration: use same error for "not found" and "wrong password"
    const INVALID_MSG = 'Invalid email or password'

    const user = await UserDAO.findByEmail(email, true)
    if (!user) {
      // Timing attack mitigation: do a fake compare
      await import('bcryptjs').then(({ compare }) =>
        compare(password, '$2b$12$invalidhashinvalidhash.invalidhash')
      )
      throw new UnauthorizedError(INVALID_MSG)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new UnauthorizedError(INVALID_MSG)
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated')
    }

    const accessToken = signAccessToken(user._id, user.role)
    const refreshToken = signRefreshToken(user._id)

    if (res) {
      setAccessCookie(res, accessToken)
      setRefreshCookie(res, refreshToken)
    }

    const userObj = user.toObject() as Omit<IUser, 'passwordHash'>
    delete (userObj as Record<string, unknown>)['passwordHash']
    return { user: userObj, accessToken }
  }

  static async logout(
    accessToken: string,
    refreshToken?: string,
    res?: Response
  ): Promise<void> {
    const accessTtl = getTokenTTL(accessToken)
    if (accessTtl > 0) {
      // Blacklist the access token until it naturally expires
      await redis.setex(`bl_${accessToken}`, accessTtl, '1')
    }

    if (refreshToken) {
      const refreshTtl = getTokenTTL(refreshToken)
      if (refreshTtl > 0) {
        // Revoke the refresh token too, so the session cannot be renewed
        await redis.setex(`bl_${refreshToken}`, refreshTtl, '1')
      }
    }

    if (res) {
      clearAccessCookie(res)
      clearRefreshCookie(res)
    }
  }

  static async refreshToken(refreshTokenCookie: string, res?: Response): Promise<string> {
    let payload
    try {
      payload = verifyRefreshToken(refreshTokenCookie)
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    // Check if refresh token is blacklisted
    const isBlacklisted = await redis.get(`bl_${refreshTokenCookie}`)
    if (isBlacklisted) {
      throw new UnauthorizedError('Refresh token has been revoked')
    }

    const user = await UserDAO.findById(payload.userId)
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated')
    }

    const newAccessToken = signAccessToken(user._id, user.role)

    // Optionally rotate refresh token
    const newRefreshToken = signRefreshToken(user._id)
    if (res) setRefreshCookie(res, newRefreshToken)

    // Blacklist the old refresh token
    const ttl = getTokenTTL(refreshTokenCookie)
    if (ttl > 0) {
      await redis.setex(`bl_${refreshTokenCookie}`, ttl, '1')
    }

    return newAccessToken
  }

  static async getMe(userId: string): Promise<IUser> {
    const user = await UserDAO.findById(userId)
    if (!user) throw new NotFoundError('User not found')
    return user
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; avatar?: string }
  ): Promise<IUser> {
    const user = await UserDAO.updateById(userId, data)
    if (!user) throw new NotFoundError('User not found')
    return user
  }
}
