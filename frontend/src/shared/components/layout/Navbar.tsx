import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MoonStar,
  SunMedium,
  UserCircle2,
  UserPlus,
  X,
} from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { useAuth } from '../../../feature/auth/hooks/useAuth'
import { apiClient } from '../../libs/axios'
import { logout } from '../../../feature/auth/state/auth.slice'
import { useTheme } from '../../../providers/ThemeProvider'
import { cn } from '../../../utils/cn'

const navLinks = [
  { label: 'Home', to: ROUTES.home() },
  { label: 'Courses', to: ROUTES.courses() },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.name) {
      return 'VL'
    }

    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [user?.name])

  async function handleLogout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      dispatch(logout())
      setMenuOpen(false)
      navigate(ROUTES.home())
    }
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border)] bg-[color:rgba(10,10,10,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.home()} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent)]">
              V
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
                VeoLMS
              </div>
              <div className="text-sm text-[var(--text)]">Learning platform</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--surface-2)] text-[var(--text)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <MoonStar className="h-4 w-4" />
              ) : (
                <SunMedium className="h-4 w-4" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--text)]">
                    <UserCircle2 className="h-4 w-4" />
                  </div>
                  <Link
                    to={ROUTES.dashboard()}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
                <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--text)]">
                  {initials}
                </div>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.login()}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm text-[var(--text)] transition hover:border-[var(--accent)]"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to={ROUTES.signup()}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign up</span>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-40 h-full w-[82vw] max-w-sm border-l border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition-transform duration-300 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Menu
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-2xl px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--surface-2)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-left text-sm"
          >
            Toggle {theme === 'dark' ? 'light' : 'dark'} mode
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to={ROUTES.dashboard()}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                to={ROUTES.login()}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                to={ROUTES.signup()}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
