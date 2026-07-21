// Set up env before importing config-dependent modules
process.env.NODE_ENV = 'test'
process.env.PORT = '3000'
process.env.MONGODB_URI = 'mongodb://localhost:27017/veolms_test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_chars_long!!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars_long!!'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud'
process.env.CLOUDINARY_API_KEY = 'test_api_key'
process.env.CLOUDINARY_API_SECRET = 'test_api_secret'
process.env.RAZORPAY_KEY_ID = 'test_key_id'
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret'
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret'
process.env.ADMIN_SECRET_KEY = 'ADMIN_SUPER_SECRET'
process.env.CLIENT_URL = 'http://localhost:5173'

import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenTTL,
} from '../../jwt.utils'

const TEST_USER_ID = '64a1234567890abcdef12345'

describe('JWT Utilities', () => {
  // ── signAccessToken ──────────────────────────────────────────────────────
  describe('signAccessToken', () => {
    it('returns a valid 3-part JWT string', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('embeds userId and role=admin in payload', () => {
      const token = signAccessToken(TEST_USER_ID, 'admin')
      const decoded = jwt.decode(token) as { userId: string; role: string }
      expect(decoded.userId).toBe(TEST_USER_ID)
      expect(decoded.role).toBe('admin')
    })

    it('embeds role=student correctly', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      const decoded = jwt.decode(token) as { userId: string; role: string }
      expect(decoded.role).toBe('student')
    })

    it('produces different tokens for different user IDs', () => {
      const t1 = signAccessToken('64a1234567890abcdef11111', 'student')
      const t2 = signAccessToken('64a1234567890abcdef22222', 'student')
      expect(t1).not.toBe(t2)
    })

    it('sets expiry of ~15 minutes from issue time', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      const decoded = jwt.decode(token) as { exp: number; iat: number }
      const duration = decoded.exp - decoded.iat
      expect(duration).toBeGreaterThanOrEqual(15 * 60 - 5)
      expect(duration).toBeLessThanOrEqual(15 * 60 + 5)
    })
  })

  // ── signRefreshToken ─────────────────────────────────────────────────────
  describe('signRefreshToken', () => {
    it('returns a valid 3-part JWT string', () => {
      const token = signRefreshToken(TEST_USER_ID)
      expect(token.split('.').length).toBe(3)
    })

    it('embeds userId in payload', () => {
      const token = signRefreshToken(TEST_USER_ID)
      const decoded = jwt.decode(token) as { userId: string }
      expect(decoded.userId).toBe(TEST_USER_ID)
    })

    it('sets expiry of ~7 days from issue time', () => {
      const token = signRefreshToken(TEST_USER_ID)
      const decoded = jwt.decode(token) as { exp: number; iat: number }
      const duration = decoded.exp - decoded.iat
      const sevenDays = 7 * 24 * 60 * 60
      expect(duration).toBeGreaterThanOrEqual(sevenDays - 5)
      expect(duration).toBeLessThanOrEqual(sevenDays + 5)
    })
  })

  // ── verifyAccessToken ────────────────────────────────────────────────────
  describe('verifyAccessToken', () => {
    it('verifies a valid access token and returns the correct payload', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      const payload = verifyAccessToken(token)
      expect(payload.userId).toBe(TEST_USER_ID)
      expect(payload.role).toBe('student')
    })

    it('throws for a tampered (invalid signature) token', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      const tampered = token.slice(0, -5) + 'XXXXX'
      expect(() => verifyAccessToken(tampered)).toThrow()
    })

    it('throws TokenExpiredError for an already-expired token', () => {
      const expired = jwt.sign(
        { userId: TEST_USER_ID, role: 'student' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: -1 }
      )
      expect(() => verifyAccessToken(expired)).toThrow(/expired/i)
    })

    it('throws for a token signed with a wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: TEST_USER_ID, role: 'student' },
        'completely_wrong_secret'
      )
      expect(() => verifyAccessToken(wrongToken)).toThrow()
    })

    it('throws for an empty string input', () => {
      expect(() => verifyAccessToken('')).toThrow()
    })
  })

  // ── verifyRefreshToken ───────────────────────────────────────────────────
  describe('verifyRefreshToken', () => {
    it('verifies a valid refresh token and returns userId', () => {
      const token = signRefreshToken(TEST_USER_ID)
      const payload = verifyRefreshToken(token)
      expect(payload.userId).toBe(TEST_USER_ID)
    })

    it('throws for a completely invalid token string', () => {
      expect(() => verifyRefreshToken('invalid.refresh.token')).toThrow()
    })

    it('throws when an access token is passed as a refresh token (cross-secret rejection)', () => {
      const accessToken = signAccessToken(TEST_USER_ID, 'student')
      expect(() => verifyRefreshToken(accessToken)).toThrow()
    })
  })

  // ── decodeToken ──────────────────────────────────────────────────────────
  describe('decodeToken', () => {
    it('decodes a token without verifying signature', () => {
      const token = signAccessToken(TEST_USER_ID, 'admin')
      const decoded = decodeToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.userId).toBe(TEST_USER_ID)
      expect(decoded?.role).toBe('admin')
    })

    it('decodes an expired token (no signature verification)', () => {
      const expired = jwt.sign(
        { userId: TEST_USER_ID, role: 'student' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: -1 }
      )
      const decoded = decodeToken(expired)
      expect(decoded?.userId).toBe(TEST_USER_ID)
    })

    it('returns null for a completely invalid string', () => {
      const result = decodeToken('this_is_not_a_jwt_at_all')
      expect(result).toBeNull()
    })
  })

  // ── getTokenTTL ──────────────────────────────────────────────────────────
  describe('getTokenTTL', () => {
    it('returns a positive TTL <= 15min for a fresh access token', () => {
      const token = signAccessToken(TEST_USER_ID, 'student')
      const ttl = getTokenTTL(token)
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(15 * 60)
    })

    it('returns 0 for an already-expired token', () => {
      const expired = jwt.sign(
        { userId: TEST_USER_ID, role: 'student' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: -1 }
      )
      expect(getTokenTTL(expired)).toBe(0)
    })

    it('returns approximately 7-day TTL for a fresh refresh token', () => {
      const token = signRefreshToken(TEST_USER_ID)
      const ttl = getTokenTTL(token)
      const sevenDays = 7 * 24 * 60 * 60
      expect(ttl).toBeGreaterThan(sevenDays - 10)
      expect(ttl).toBeLessThanOrEqual(sevenDays)
    })
  })
})
