import { useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ISection, ILesson } from '../../../types/course.types'

interface UseLearnNavigationProps {
  courseSlug: string
  curriculum: ISection[]
  currentLessonId: string
  isLessonCompleted?: boolean
}

export function useLearnNavigation({
  courseSlug,
  curriculum,
  currentLessonId,
  isLessonCompleted,
}: UseLearnNavigationProps) {
  const navigate = useNavigate()

  const flatLessons = useMemo(() => {
    const lessons: ILesson[] = []
    curriculum.forEach((section) => {
      if (section.lessons) {
        lessons.push(...section.lessons)
      }
    })
    return lessons
  }, [curriculum])

  const currentIndex = useMemo(() => {
    return flatLessons.findIndex((l) => l._id === currentLessonId)
  }, [flatLessons, currentLessonId])

  const nextLesson = useMemo(() => {
    if (currentIndex === -1 || currentIndex >= flatLessons.length - 1) return null
    return flatLessons[currentIndex + 1]
  }, [flatLessons, currentIndex])

  const prevLesson = useMemo(() => {
    if (currentIndex <= 0) return null
    return flatLessons[currentIndex - 1]
  }, [flatLessons, currentIndex])

  const navigateToLesson = useCallback(
    (lessonId: string) => {
      navigate(`/learn/${courseSlug}/${lessonId}`)
    },
    [navigate, courseSlug]
  )

  // Keyboard shortcut ArrowRight for next lesson
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && isLessonCompleted && nextLesson) {
        navigateToLesson(nextLesson._id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLessonCompleted, nextLesson, navigateToLesson])

  return {
    flatLessons,
    currentIndex,
    nextLesson,
    prevLesson,
    navigateToLesson,
  }
}
