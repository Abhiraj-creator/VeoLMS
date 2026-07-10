import { useEffect, type ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { apiClient } from '../shared/libs/axios'
import { logout, setCredentials, setLoading } from '../feature/auth/state/auth.slice'
import type { RootState } from '../app/app.store'
import { Spinner } from '../shared/components/ui/Spinner'

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch()
  const { accessToken, isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    let active = true

    async function hydrateAuth() {
      if (!accessToken) {
        dispatch(setLoading(false))
        return
      }

      dispatch(setLoading(true))

      try {
        const response = await apiClient.get('/auth/me')
        const user = response.data?.data?.user
        const currentToken = (response.config.headers?.Authorization as string | undefined)?.replace(
          /^Bearer\s+/i,
          ''
        )

        if (active && user) {
          dispatch(
            setCredentials({
              user,
              accessToken: currentToken ?? accessToken,
            })
          )
        }
      } catch {
        if (active) {
          dispatch(logout())
        }
      } finally {
        if (active) {
          dispatch(setLoading(false))
        }
      }
    }

    void hydrateAuth()

    return () => {
      active = false
    }
  }, [accessToken, dispatch])

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text)]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[var(--shadow)]">
          <Spinner label="Loading your workspace" />
        </div>
      </div>
    )
  }

  return children
}
