import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white border border-transparent hover:opacity-95 focus-visible:ring-[var(--accent)]',
  secondary:
    'bg-transparent text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] focus-visible:ring-[var(--accent)]',
  ghost:
    'bg-transparent text-[var(--muted)] border border-transparent hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:ring-[var(--accent)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  )
}
