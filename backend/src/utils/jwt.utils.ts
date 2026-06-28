import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { config } from '../config/config'

export interface JWTPayload {
  userId: string
  role: 'student' | 'admin'
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  iat?: number
  exp?: number
}

export function signAccessToken(
  userId: mongoose.Types.ObjectId | string,
  role: 'student' | 'admin'
): string {
  const payload: JWTPayload = { userId: userId.toString(), role }
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(userId: mongoose.Types.ObjectId | string): string {
  const payload: RefreshTokenPayload = { userId: userId.toString() }
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

/** Returns remaining TTL in seconds for a given JWT, or 0 if expired */
export function getTokenTTL(token: string): number {
  const decoded = decodeToken(token)
  if (!decoded?.exp) return 0
  const ttl = decoded.exp - Math.floor(Date.now() / 1000)
  return Math.max(0, ttl)
}
