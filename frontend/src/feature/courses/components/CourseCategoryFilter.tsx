import { cn } from '../../../utils/cn'
import type { CourseCategory } from '../../../types/course.types'

const categories: Array<CourseCategory | 'All'> = ['All', 'Frontend', 'Backend', 'Fullstack', 'Other']

interface CourseCategoryFilterProps {
  value: string
  onChange: (value: string) => void
}

export function CourseCategoryFilter({ value, onChange }: CourseCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = value === category || (!value && category === 'All')

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category === 'All' ? '' : category)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
