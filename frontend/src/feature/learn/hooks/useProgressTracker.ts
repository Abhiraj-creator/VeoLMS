import { useEffect, useRef, useCallback } from 'react'
import { useSaveProgressMutation } from '../api/learn.api'

interface UseProgressTrackerProps {
  lessonId: string
  courseId: string
}

export function useProgressTracker({ lessonId, courseId }: UseProgressTrackerProps) {
  const [saveProgressMutation] = useSaveProgressMutation()
  const progressRef = useRef({ watchedSeconds: 0, totalSeconds: 0 })
  const lastSavedRef = useRef<number>(0)

  const saveProgress = useCallback(
    async (force = false) => {
      const { watchedSeconds, totalSeconds } = progressRef.current
      if (totalSeconds <= 0 || watchedSeconds <= 0) return

      // Prevent redundant saves if nothing changed and not forced, or within 2 seconds
      const now = Date.now()
      if (!force && now - lastSavedRef.current < 2000) return

      lastSavedRef.current = now

      try {
        await saveProgressMutation({
          lessonId,
          courseId,
          watchedSeconds: Math.floor(watchedSeconds),
          totalSeconds: Math.floor(totalSeconds),
        }).unwrap()
      } catch (err) {
        console.error('Failed to save progress:', err)
      }
    },
    [lessonId, courseId, saveProgressMutation]
  )

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    progressRef.current = {
      watchedSeconds: currentTime,
      totalSeconds: duration,
    }
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(false)
    }, 30000)

    return () => {
      clearInterval(interval)
      // Save progress on unmount/lesson change
      saveProgress(true)
    }
  }, [saveProgress])

  return {
    handleTimeUpdate,
    saveProgress,
  }
}
