import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit'
import { logout } from '../../feature/auth/state/auth.slice'

export const rtkQueryErrorMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const status = (action.payload as { status?: number } | undefined)?.status

    if (status === 401) {
      storeApi.dispatch(logout())
    }
  }

  return next(action)
}
