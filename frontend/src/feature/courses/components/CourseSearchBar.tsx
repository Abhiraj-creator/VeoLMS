import { Search } from 'lucide-react'

interface CourseSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function CourseSearchBar({ value, onChange }: CourseSearchBarProps) {
  return (
    <label className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <Search className="h-4 w-4 text-[var(--muted)]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search courses"
        className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
      />
    </label>
  )
}
