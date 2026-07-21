import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} from '../api/admin.api'
import { LessonBuilder } from './LessonBuilder'
import type { ISection } from '../../../types/course.types'

interface SectionBuilderProps {
  courseId: string
  sections: ISection[]
  onRefresh: () => void
}

export function SectionBuilder({ courseId, sections, onRefresh }: SectionBuilderProps) {
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  
  // Local state to track which section is currently adding a lesson
  // maps sectionId -> true/false
  const [addingLessonToSection, setAddingLessonToSection] = useState<Record<string, boolean>>({})

  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation()
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation()
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation()

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      alert('Section title is required')
      return
    }

    try {
      const order = sections.length + 1
      await createSection({
        courseId,
        title: newSectionTitle,
        order,
      }).unwrap()
      setNewSectionTitle('')
      setIsAddingSection(false)
      onRefresh()
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to create section'
      alert(errorMsg)
    }
  }

  const handleStartEdit = (section: ISection) => {
    setEditingSectionId(section._id)
    setEditingTitle(section.title)
  }

  const handleSaveEdit = async (sectionId: string) => {
    if (!editingTitle.trim()) {
      alert('Section title is required')
      return
    }

    try {
      await updateSection({
        sectionId,
        data: { title: editingTitle },
      }).unwrap()
      setEditingSectionId(null)
      onRefresh()
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to update section'
      alert(errorMsg)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? All lessons inside will be deleted.')) return

    try {
      await deleteSection(sectionId).unwrap()
      onRefresh()
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to delete section'
      alert(errorMsg)
    }
  }

  const handleAddLessonStart = (sectionId: string) => {
    setAddingLessonToSection((prev) => ({
      ...prev,
      [sectionId]: true,
    }))
    // Ensure section is expanded
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: true,
    }))
  }

  const handleAddLessonCancel = (sectionId: string) => {
    setAddingLessonToSection((prev) => ({
      ...prev,
      [sectionId]: false,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Course Curriculum</h2>
          <p className="text-sm text-[var(--muted)]">Create and organize sections and lessons for your students.</p>
        </div>
        {!isAddingSection && (
          <button
            type="button"
            onClick={() => setIsAddingSection(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      {isAddingSection && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text)]">New Section</h3>
          <input
            type="text"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="e.g. Getting Started"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            disabled={isCreating}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingSection(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Create Section
            </button>
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-14 text-center">
          <p className="font-semibold text-[var(--text)]">No curriculum built yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Add your first section to start adding lessons.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const isExpanded = expandedSections[section._id] !== false // Default to expanded
            const isEditing = editingSectionId === section._id
            const isAddingLesson = addingLessonToSection[section._id]

            return (
              <div key={section._id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
                  <div className="flex-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(section._id)}
                      className="text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-md">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          disabled={isUpdating}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(section._id)}
                          className="p-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-orange-600 disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSectionId(null)}
                          className="p-1.5 rounded-lg bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                          disabled={isUpdating}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                        <span className="text-[var(--muted)] font-mono text-sm">Section {index + 1}:</span>
                        {section.title}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLessonStart(section._id)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(section)}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
                      title="Edit section title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteSection(section._id)}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--border)] hover:text-red-500 disabled:opacity-50"
                      title="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 bg-[var(--background)] space-y-3">
                    {/* Lesson list */}
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lessonIdx) => (
                        <LessonBuilder
                          key={lesson._id}
                          lesson={lesson}
                          sectionId={section._id}
                          order={lessonIdx + 1}
                          onRefresh={onRefresh}
                        />
                      ))
                    ) : (
                      !isAddingLesson && (
                        <p className="text-sm text-[var(--muted)] py-2">No lessons in this section yet.</p>
                      )
                    )}

                    {/* Add Lesson form */}
                    {isAddingLesson && (
                      <LessonBuilder
                        sectionId={section._id}
                        order={(section.lessons?.length || 0) + 1}
                        onRefresh={() => {
                          setAddingLessonToSection((prev) => ({ ...prev, [section._id]: false }))
                          onRefresh()
                        }}
                        onCancelNew={() => handleAddLessonCancel(section._id)}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
