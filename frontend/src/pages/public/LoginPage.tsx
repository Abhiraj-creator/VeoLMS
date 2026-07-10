import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { LoginForm } from '../../feature/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          to={ROUTES.home()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">VeoLMS</p>
            <h1 className="text-3xl font-semibold tracking-normal text-[var(--text)]">
              Sign in
            </h1>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)]">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span>Access your dashboard, courses, and progress.</span>
          </div>
          <LoginForm />
          <p className="mt-6 text-sm text-[var(--muted)]">
            New here?{' '}
            <Link to={ROUTES.signup()} className="text-[var(--accent)] transition hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
