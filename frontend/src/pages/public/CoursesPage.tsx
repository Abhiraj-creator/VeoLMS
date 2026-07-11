import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CourseGrid } from '../../feature/courses/components/CourseGrid'
import { CourseSearchBar } from '../../feature/courses/components/CourseSearchBar'
import { CourseCategoryFilter } from '../../feature/courses/components/CourseCategoryFilter'
import { useGetCoursesQuery } from '../../feature/courses/api/courses.api'
import { useDebounce } from '../../shared/hooks/useDebounce'

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const debouncedQuery = useDebounce(query, 300)
  const { data, isLoading } = useGetCoursesQuery({ limit: 100, page: 1 })

  useEffect(() => {
    const next = new URLSearchParams(searchParams)

    if (debouncedQuery) {
      next.set('q', debouncedQuery)
    } else {
      next.delete('q')
    }

    if (category) {
      next.set('category', category)
    } else {
      next.delete('category')
    }

    setSearchParams(next, { replace: true })
  }, [category, debouncedQuery, searchParams, setSearchParams])

  const filteredCourses = useMemo(() => {
    const courses = data?.courses ?? []
    const normalizedQuery = debouncedQuery.trim().toLowerCase()

    return courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.shortDescription, course.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCategory = !category || course.category === category

      return matchesQuery && matchesCategory
    })
  }, [category, data?.courses, debouncedQuery])

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Browse</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-[var(--text)]">
            Course listing
          </h1>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <CourseSearchBar value={query} onChange={setQuery} />
          <CourseCategoryFilter value={category} onChange={setCategory} />
        </div>
      </section>

      <CourseGrid
        courses={filteredCourses}
        isLoading={isLoading}
        emptyMessage="No courses found for your search"
      />
    </div>
  )
}
