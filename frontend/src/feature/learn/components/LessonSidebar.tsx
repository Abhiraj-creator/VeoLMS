import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import type { ISection } from '../../../types/course.types'
import type { ICourseProgress } from '../../../types/progress.types'
import { formatDuration } from '../../../utils/formatDuration'
import { cn } from '../../../utils/cn'

interface LessonSidebarProps {
  courseTitle: string
  sections: ISection[]
  activeLessonId: string
  progress: ICourseProgress[]
  onLessonSelect: (lessonId: string) => void
  onBackToDashboard: () => void
}

export function LessonSidebar({
  courseTitle,
  sections,
  activeLessonId,
  progress,
  onLessonSelect,
  onBackToDashboard,
}: LessonSidebarProps) {
  // Store expanded sections by sectionId
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Auto-expand the section containing the active lesson on load
  useEffect(() => {
    if (!sections || !activeLessonId) return
    const activeSection = sections.find((s) =>
      s.lessons?.some((l) => l._id === activeLessonId)
    )
    if (activeSection) {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSection._id]: true,
      }))
    }
  }, [sections, activeLessonId])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress?.find((p) => p.lessonId === lessonId)?.completed ?? false
  }

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
      <div className="border-b border-[var(--border)] p-4">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
        >
          ← Back to Dashboard
        </button>
        <h2 className="line-clamp-2 text-lg font-semibold tracking-tight" title={courseTitle}>
          {courseTitle}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sections.map((section, idx) => {
          const isExpanded = expandedSections[section._id] ?? false
          const sectionLessons = section.lessons ?? []

          return (
            <div key={section._id} className="rounded-lg overflow-hidden border border-[var(--border)]">
              <button
                type="button"
                onClick={() => toggleSection(section._id)}
                className="flex w-full items-center justify-between bg-[var(--surface-2)] p-3 text-left transition hover:bg-[var(--surface-3)]"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                    Section {section.order ?? idx + 1}
                  </p>
                  <p className="font-medium text-sm truncate text-[var(--text)]">{section.title}</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                )}
              </button>

              {isExpanded && (
                <div className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {sectionLessons.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--muted)] text-center">No lessons in this section</div>
                  ) : (
                    sectionLessons.map((lesson) => {
                      const isActive = lesson._id === activeLessonId
                      const completed = isLessonCompleted(lesson._id)

                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          onClick={() => onLessonSelect(lesson._id)}
                          className={cn(
                            'flex w-full items-start gap-3 p-3 text-left transition hover:bg-[var(--surface-2)]',
                            isActive && 'bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]'
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            {completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : isActive ? (
                              <PlayCircle className="h-4 w-4 text-[var(--accent)]" />
                            ) : (
                              <Circle className="h-4 w-4 text-[var(--muted)]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                'text-sm font-medium leading-5 transition text-[var(--text)]',
                                isActive && 'text-[var(--accent)] font-semibold'
                              )}
                            >
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {formatDuration(lesson.duration)}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default LessonSidebar
