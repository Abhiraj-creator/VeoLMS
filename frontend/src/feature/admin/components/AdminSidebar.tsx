import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Receipt,
  BarChart2,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { useDispatch } from 'react-redux'
import { useLogoutMutation } from '../../auth/api/auth.api'
import { logout } from '../../auth/state/auth.slice'
import type { AppDispatch } from '../../../app/app.store'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.admin(), icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Courses', to: ROUTES.adminCourses(), icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Students', to: ROUTES.adminStudents(), icon: <Users className="h-4 w-4" /> },
  { label: 'Enrollments', to: ROUTES.adminEnrollments(), icon: <Receipt className="h-4 w-4" /> },
  { label: 'Analytics', to: ROUTES.adminAnalytics(), icon: <BarChart2 className="h-4 w-4" /> },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [logoutMutation] = useLogoutMutation()

  async function handleLogout() {
    try {
      await logoutMutation().unwrap()
    } catch {
      // ignore
    } finally {
      dispatch(logout())
      navigate(ROUTES.home())
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-white text-xs font-bold">
          V
        </div>
        <div>
          <p className="text-xs font-semibold leading-tight text-[var(--text)]">VeoLMS</p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.admin()}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
              ].join(' ')
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[var(--border)] px-3 py-3 space-y-1">
        <button
          type="button"
          onClick={() => navigate(ROUTES.home())}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Site
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
