import { Request, Response } from 'express'
import { AuthService } from '../service/auth.service'
import { sendSuccess } from '../utils/apiResponse'
import { asyncHandler } from '../utils/asyncHandler'

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, adminKey } = req.body as {
    name: string
    email: string
    password: string
    adminKey?: string
  }

  const result = await AuthService.signup(name, email, password, adminKey, res)

  sendSuccess(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Account created successfully',
    201
  )
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }

  const result = await AuthService.login(email, password, res)

  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful')
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.slice(7) ?? ''

  await AuthService.logout(token, res)

  sendSuccess(res, null, 'Logged out successfully')
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined

  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'No refresh token provided' })
    return
  }

  const accessToken = await AuthService.refreshToken(refreshToken, res)

  sendSuccess(res, { accessToken }, 'Token refreshed successfully')
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()
  const user = await AuthService.getMe(userId)
  sendSuccess(res, { user }, 'User profile retrieved')
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()
  const data = req.body as { name?: string; avatar?: string }

  const user = await AuthService.updateProfile(userId, data)
  sendSuccess(res, { user }, 'Profile updated successfully')
})
