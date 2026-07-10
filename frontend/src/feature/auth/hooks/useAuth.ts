import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/app.store'

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  )

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    role: user?.role ?? null,
  }
}
