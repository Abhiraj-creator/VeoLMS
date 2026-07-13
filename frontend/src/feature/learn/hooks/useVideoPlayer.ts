import { useEffect, useRef, useState } from 'react'
import Plyr from 'plyr'
import { useGetLessonVideoQuery, useGetLessonProgressQuery } from '../api/learn.api'

interface UseVideoPlayerProps {
  courseSlug: string
  lessonId: string
}

export function useVideoPlayer({ courseSlug, lessonId }: UseVideoPlayerProps) {
  const { data: videoData, isLoading: isVideoLoading, isError: isVideoError } = useGetLessonVideoQuery(
    { courseSlug, lessonId },
    { skip: !courseSlug || !lessonId }
  )
  const { data: progressData } = useGetLessonProgressQuery(lessonId, { skip: !lessonId })

  const [player, setPlayer] = useState<Plyr | null>(null)
  const isInitialSeekDone = useRef(false)

  // Reset seek state when lessonId changes
  useEffect(() => {
    isInitialSeekDone.current = false
  }, [lessonId])

  // Handle seeking to watchedSeconds when both player and progressData are ready
  useEffect(() => {
    if (player && progressData && !isInitialSeekDone.current) {
      const watched = progressData.watchedSeconds || 0
      const total = progressData.totalSeconds || 0

      // Only seek if watched progress is less than 95% of total to avoid auto-completion loop
      if (watched > 0 && watched < total * 0.95) {
        const handleReady = () => {
          Object.assign(player, { currentTime: watched })
          isInitialSeekDone.current = true
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p: any = player
        if (p.ready) {
          Object.assign(player, { currentTime: watched })
          isInitialSeekDone.current = true
        } else {
          player.once('ready', handleReady)
        }
      } else {
        isInitialSeekDone.current = true
      }
    }
  }, [player, progressData, lessonId])

  return {
    videoUrl: videoData?.videoUrl || '',
    isLoading: isVideoLoading,
    isError: isVideoError,
    setPlayer,
  }
}
