import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={inputId} className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </label>
  )
})
