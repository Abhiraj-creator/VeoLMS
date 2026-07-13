import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../../feature/auth/hooks/useAuth'
import { Spinner } from '../ui/Spinner'

/**
 * AdminApp — root shell for all /admin/* routes.
 * Renders no public Navbar; admin pages bring their own AdminLayout.
 * Also enforces the admin-only access guard.
 */
export function AdminApp() {
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[var(--bg)]">
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

  // Each admin page wraps itself in AdminLayout — no extra wrapper needed here
  return <Outlet />
}
