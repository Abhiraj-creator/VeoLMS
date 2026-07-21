import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../../shared/components/layout/AdminLayout'
import { ChevronRight, ArrowLeft, Save, Check } from 'lucide-react'
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from '../../feature/admin/api/admin.api'
import { useGetCourseBySlugQuery } from '../../feature/courses/api/courses.api'
import { TipTapEditor } from '../../feature/admin/components/TipTapEditor'
import { VideoUploader } from '../../feature/admin/components/VideoUploader'
import { SectionBuilder } from '../../feature/admin/components/SectionBuilder'
import type { CourseCategory } from '../../types/course.types'

export default function AdminCourseFormPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  // Fetch course details if editing
  const { data: courseData, isLoading: isFetching, refetch } = useGetCourseBySlugQuery(
    courseId || '',
    { skip: !courseId }
  )

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation()

  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Course Details State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<CourseCategory>('Other')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string | null>(null)

  // Populate data when editing
  useEffect(() => {
    if (courseData?.course) {
      const c = courseData.course
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(c.title)
      setSlug(c.slug)
      setCategory(c.category)
      setShortDescription(c.shortDescription || '')
      setDescription(c.description)
      setPrice(c.price)
      setTags(c.tags?.join(', ') || '')
      setThumbnailUrl(c.thumbnailUrl)
      setThumbnailPublicId(c.thumbnailPublicId)
    }
  }, [courseData])

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!courseId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(generated)
    }
  }

  const handleThumbnailUploadComplete = (res: { url: string; publicId: string }) => {
    setThumbnailUrl(res.url)
    setThumbnailPublicId(res.publicId)
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slug.trim() || !description.trim()) {
      alert('Title, Slug and Description are required.')
      return
    }

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title,
      slug,
      category,
      shortDescription,
      description,
      price: Number(price),
      tags: tagsArray,
      thumbnailUrl,
      thumbnailPublicId,
    }

    try {
      if (courseId) {
        // Update
        await updateCourse({ id: courseId, data: payload }).unwrap()
        alert('Course details updated successfully!')
        setStep(2)
      } else {
        // Create
        const createdCourse = await createCourse(payload).unwrap()
        alert('Course created successfully!')
        navigate(`/admin/courses/${createdCourse._id}/edit`)
        setStep(2)
      }
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to save course details'
      alert(errorMsg)
    }
  }

  const isSaving = isCreating || isUpdating

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/courses')}
            className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {courseId ? `Edit: ${title}` : 'Create Course'}
          </h1>
        </div>

        {/* Steps Tab Indicators */}
        <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] p-1.5 border border-[var(--border)] self-start sm:self-auto">
          <button
            onClick={() => setStep(1)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 1
                ? 'bg-[var(--background)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            1. Details
          </button>
          <ChevronRight className="h-3 w-3 text-[var(--muted)]" />
          <button
            disabled={!courseId}
            onClick={() => setStep(2)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              step === 2
                ? 'bg-[var(--background)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            2. Curriculum
          </button>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSaveDetails} className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-3">Course Metadata</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Course Title</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="e.g. Master React in 30 Days"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Course Slug</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="e.g. master-react-in-30-days"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isSaving || !!courseId}
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Category</label>
                <select
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CourseCategory)}
                  disabled={isSaving}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Fullstack">Fullstack</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm text-[var(--muted)] font-mono">₹</span>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none font-mono"
                    placeholder="499"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    disabled={isSaving}
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Short Description</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={160}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Summarize this course in 160 characters..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  disabled={isSaving}
                />
                <span className="absolute right-4 top-3 text-[10px] font-mono text-[var(--muted)]">
                  {shortDescription.length}/160
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Full Description</label>
              <TipTapEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide a comprehensive course description..."
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Tags (Comma-separated)</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="react, frontend, hooks"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Course Thumbnail</label>
                <VideoUploader
                  type="image"
                  onUploadComplete={handleThumbnailUploadComplete}
                  initialPreview={thumbnailUrl}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:bg-neutral-800 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {courseId ? 'Update & Continue' : 'Create & Continue'}
            </button>
          </div>
        </form>
      ) : (
        <div className="max-w-4xl">
          <SectionBuilder
            courseId={courseId || ''}
            sections={courseData?.curriculum || []}
            onRefresh={refetch}
          />
          <div className="mt-8 flex justify-between border-t border-[var(--border)] pt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:bg-neutral-800 transition-colors"
            >
              Back to Details
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Finish Building
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
