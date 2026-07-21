import { useState, useCallback, useRef } from 'react'
import { API_BASE_URL } from '../../../constants/api'
import { useAuth } from '../../auth/hooks/useAuth'

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadResponse {
  url: string
  publicId: string
  duration?: number
  format?: string
  bytes?: number
}

export function useUpload() {
  const { accessToken } = useAuth()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<UploadResponse | null>(null)

  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const reset = useCallback(() => {
    setProgress(0)
    setStatus('idle')
    setError(null)
    setData(null)
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
  }, [])

  const upload = useCallback(
    (file: File, type: 'image' | 'video'): Promise<UploadResponse> => {
      return new Promise((resolve, reject) => {
        reset()
        setStatus('uploading')

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        const endpoint = type === 'image' ? '/upload/image' : '/upload/video'
        xhr.open('POST', `${API_BASE_URL}${endpoint}`)

        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText)
              const uploadData = res.data as UploadResponse
              setData(uploadData)
              setStatus('success')
              resolve(uploadData)
            } catch {
              const errMsg = 'Failed to parse upload response'
              setError(errMsg)
              setStatus('error')
              reject(new Error(errMsg))
            }
          } else {
            let errMsg = 'Upload failed'
            try {
              const res = JSON.parse(xhr.responseText)
              errMsg = res.message || errMsg
            } catch (err) {
              console.error('Failed to parse error response text', err)
            }
            setError(errMsg)
            setStatus('error')
            reject(new Error(errMsg))
          }
        }

        xhr.onerror = () => {
          const errMsg = 'Network error during upload'
          setError(errMsg)
          setStatus('error')
          reject(new Error(errMsg))
        }

        const formData = new FormData()
        formData.append(type, file)

        xhr.send(formData)
      })
    },
    [accessToken, reset]
  )

  return {
    progress,
    status,
    error,
    data,
    upload,
    reset,
  }
}
