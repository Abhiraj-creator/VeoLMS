import { LogIn, ArrowRight } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { useAuthForm } from '../hooks/useAuthForm'

export function LoginForm() {
  const form = useAuthForm('login')

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={form.values.email}
        onChange={form.handleChange}
        error={form.errors.email}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={form.values.password}
        onChange={form.handleChange}
        error={form.errors.password}
      />

      {form.error ? <p className="text-sm text-red-400">{form.error}</p> : null}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-[var(--muted)] transition hover:text-[var(--text)]"
          onClick={(event) => event.preventDefault()}
        >
          Forgot password?
        </button>

        <span className="text-[var(--muted)]">Secure sign in</span>
      </div>

      <Button type="submit" loading={form.isLoading} className="w-full">
        <LogIn className="h-4 w-4" />
        <span>Sign in</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  )
}
