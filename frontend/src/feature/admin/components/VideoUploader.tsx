import React, { useRef, useState } from 'react'
import { Film, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useUpload } from '../hooks/useUpload'

interface VideoUploaderProps {
  onUploadComplete: (result: { url: string; publicId: string; duration?: number }) => void
  type: 'image' | 'video'
  initialPreview?: string | null
}

export function VideoUploader({ onUploadComplete, type, initialPreview = null }: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { progress, status, error, data, upload, reset } = useUpload()
  const [dragActive, setDragActive] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(initialPreview)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const processFile = async (file: File) => {
    // Basic format checks
    const isImage = type === 'image' && file.type.startsWith('image/')
    const isVideo = type === 'video' && file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      alert(`Please upload a valid ${type} file.`)
      return
    }

    // Set local preview if it is an image
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    try {
      const res = await upload(file, type)
      onUploadComplete({
        url: res.url,
        publicId: res.publicId,
        duration: res.duration,
      })
      if (type === 'video') {
        setLocalPreview(res.url)
      }
    } catch {
      // Error is handled in hook state
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={type === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm,video/quicktime'}
        onChange={handleChange}
        disabled={status === 'uploading'}
      />

      {status === 'idle' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all hover:bg-[var(--surface)] ${
            dragActive ? 'border-[var(--accent)] bg-[var(--surface)]' : 'border-[var(--border)]'
          } ${localPreview ? 'relative min-h-[160px] overflow-hidden' : 'py-10'}`}
        >
          {localPreview ? (
            <>
              {type === 'image' ? (
                <img
                  src={localPreview}
                  alt="Preview"
                  className="absolute inset-0 h-full w-full object-cover opacity-40 hover:opacity-70 transition-opacity"
                />
              ) : (
                <video
                  src={localPreview}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 hover:opacity-70 transition-opacity"
                  muted
                  playsInline
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1 rounded-lg bg-black/60 px-4 py-2 text-white">
                <RefreshCw className="h-5 w-5 text-white" />
                <span className="text-xs font-medium">Replace {type}</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 rounded-full bg-[var(--surface)] p-3 text-[var(--muted)]">
                {type === 'image' ? <ImageIcon className="h-6 w-6" /> : <Film className="h-6 w-6" />}
              </div>
              <p className="text-sm font-medium text-[var(--text)]">
                Drag and drop your {type} here, or <span className="text-[var(--accent)] hover:underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {type === 'image' ? 'JPG, PNG or WEBP up to 5MB' : 'MP4, WEBM or MOV up to 500MB'}
              </p>
            </>
          )}
        </div>
      )}

      {status === 'uploading' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text)]">Uploading {type}...</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-400">Upload complete</p>
              {data?.duration && (
                <p className="text-xs text-[var(--muted)]">
                  Duration: {Math.round(data.duration)}s
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
          >
            Change
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Upload failed</p>
              <p className="text-xs text-[var(--muted)] mt-1">{error || 'An error occurred during upload'}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onButtonClick}
              className="rounded-lg bg-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-neutral-800"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
