interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
}

export function Spinner({ label = '', size = 'md' }: SpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
      <span
        className={`inline-block animate-spin rounded-full border-[color:var(--accent)] border-t-transparent ${sizeClasses[size]}`}
      />
      {label ? <span>{label}</span> : null}
    </div>
  )
}
