import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../feature/auth/hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function AdminRoute() {
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner label="Checking admin access" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
