import { useState } from 'react'
import { Trash2, Edit, X, Check, PlayCircle } from 'lucide-react'
import {
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  type UpdateLessonPayload,
} from '../api/admin.api'
import { VideoUploader } from './VideoUploader'
import type { ILesson } from '../../../types/course.types'

interface LessonBuilderProps {
  lesson?: ILesson
  sectionId: string
  order: number
  onRefresh: () => void
  onCancelNew?: () => void
}

export function LessonBuilder({
  lesson,
  sectionId,
  order,
  onRefresh,
  onCancelNew,
}: LessonBuilderProps) {
  const [isEditing, setIsEditing] = useState(!lesson)
  const [title, setTitle] = useState(lesson?.title || '')
  const [content, setContent] = useState(lesson?.content || '')
  const [isPreview, setIsPreview] = useState(lesson?.isPreview || false)
  const [videoDetails, setVideoDetails] = useState<{
    url: string
    publicId: string
    duration?: number
  } | null>(null)

  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation()
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation()
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteLessonMutation()

  const handleVideoUploadComplete = (res: { url: string; publicId: string; duration?: number }) => {
    setVideoDetails(res)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lesson title is required')
      return
    }

    try {
      if (lesson) {
        // Update
        const payload: UpdateLessonPayload = { title, content, isPreview }
        if (videoDetails) {
          payload.videoUrl = videoDetails.url
          payload.cloudinaryPublicId = videoDetails.publicId
          payload.duration = videoDetails.duration
        }
        await updateLesson({ lessonId: lesson._id, data: payload }).unwrap()
      } else {
        // Create
        await createLesson({
          sectionId,
          title,
          content: content || 'No description provided.',
          videoUrl: videoDetails?.url || null,
          cloudinaryPublicId: videoDetails?.publicId || null,
          duration: videoDetails?.duration || 0,
          order,
          isPreview,
        }).unwrap()
      }
      setIsEditing(false)
      onRefresh()
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to save lesson'
      alert(errorMsg)
    }
  }

  const handleDelete = async () => {
    if (!lesson) {
      if (onCancelNew) onCancelNew()
      return
    }
    if (!confirm('Are you sure you want to delete this lesson?')) return

    try {
      await deleteLesson(lesson._id).unwrap()
      onRefresh()
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to delete lesson'
      alert(errorMsg)
    }
  }

  const isSaving = isCreating || isUpdating

  if (!isEditing && lesson) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition-all hover:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="rounded bg-[var(--surface)] p-1.5 text-[var(--muted)]">
            <PlayCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)]">{lesson.title}</h4>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--muted)]">
              {lesson.duration ? (
                <span>{Math.round(lesson.duration / 60)} mins</span>
              ) : (
                <span>No video</span>
              )}
              {lesson.isPreview && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                  <span className="text-orange-500 font-medium">Free Preview</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
            title="Edit lesson"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-red-500 disabled:opacity-50"
            title="Delete lesson"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {lesson ? 'Edit Lesson' : 'New Lesson'}
        </h4>
        {lesson && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="e.g. Introduction to React"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
            Lesson Description / Notes
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="What will students learn in this lesson?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2">
            Lesson Video
          </label>
          <VideoUploader
            type="video"
            onUploadComplete={handleVideoUploadComplete}
            initialPreview={lesson?.duration ? '/mock-video.mp4' : null} // Simple trigger to show it has video
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id={`preview-${sectionId}-${order}`}
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--border)] bg-[var(--background)] text-[var(--accent)] focus:ring-[var(--accent)]"
            checked={isPreview}
            onChange={(e) => setIsPreview(e.target.checked)}
            disabled={isSaving}
          />
          <label
            htmlFor={`preview-${sectionId}-${order}`}
            className="text-xs font-medium text-[var(--text)] cursor-pointer"
          >
            Allow free preview (students can watch without enrolling)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          disabled={isSaving}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {lesson ? 'Delete' : 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save Lesson
        </button>
      </div>
    </div>
  )
}
