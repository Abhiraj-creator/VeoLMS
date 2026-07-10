import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IUser } from '../../../types/user.types'

export interface AuthState {
  user: IUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface StoredAuth {
  user: IUser | null
  accessToken: string | null
}

const storageKey = 'veolms.auth'

function readStoredAuth(): StoredAuth {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null }
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return { user: null, accessToken: null }
    }

    return JSON.parse(raw) as StoredAuth
  } catch {
    return { user: null, accessToken: null }
  }
}

function persistAuth(auth: StoredAuth): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!auth.accessToken) {
    window.localStorage.removeItem(storageKey)
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(auth))
}

const storedAuth = readStoredAuth()

const initialState: AuthState = {
  user: storedAuth.user,
  accessToken: storedAuth.accessToken,
  isAuthenticated: Boolean(storedAuth.accessToken),
  isLoading: Boolean(storedAuth.accessToken),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser | null; accessToken: string }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.isLoading = false
      persistAuth({
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      })
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isLoading = false
      persistAuth({ user: null, accessToken: null })
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions
export default authSlice.reducer
