import { useState } from 'react'
import { UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { cn } from '../../../utils/cn'
import { useAuthForm } from '../hooks/useAuthForm'

function PasswordStrength({ score }: { score: number }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`password-strength-${index}`}
            className={cn(
              'h-2 rounded-full transition-colors',
              index < score ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Use 8+ characters with upper case, a number, and a special character.
      </p>
    </div>
  )
}

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const form = useAuthForm('signup')

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        type="text"
        placeholder="Your full name"
        autoComplete="name"
        value={form.values.name}
        onChange={form.handleChange}
        error={form.errors.name}
      />

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

      <div className="space-y-2">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={form.handleChange}
          error={form.errors.password}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PasswordStrength score={form.passwordScore} />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="inline-flex items-center gap-2 self-start text-sm text-[var(--muted)] transition hover:text-[var(--text)] sm:justify-end"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPassword ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={form.showAdminKey}
          onChange={(event) => form.setShowAdminKey(event.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]"
        />
        <span>Have an admin key? Enter it to register as admin</span>
      </label>

      {form.showAdminKey ? (
        <Input
          label="Admin key"
          name="adminKey"
          type="password"
          placeholder="Enter admin key"
          autoComplete="off"
          value={form.values.adminKey}
          onChange={form.handleChange}
          error={form.errors.adminKey}
        />
      ) : null}

      {form.error ? <p className="text-sm text-red-400">{form.error}</p> : null}

      <Button type="submit" loading={form.isLoading} className="w-full">
        <UserPlus className="h-4 w-4" />
        <span>Create account</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  )
}
