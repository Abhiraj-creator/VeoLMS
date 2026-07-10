import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../feature/auth/hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner label="Checking access" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`
    return <Navigate to={ROUTES.login(redirectTo)} replace state={{ from: redirectTo }} />
  }

  return <Outlet />
}
