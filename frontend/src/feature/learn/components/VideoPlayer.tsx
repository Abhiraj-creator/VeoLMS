import { useEffect, useRef } from 'react'
import Plyr from 'plyr'

interface VideoPlayerProps {
  videoUrl: string
  onReady?: (player: Plyr) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function VideoPlayer({
  videoUrl,
  onReady,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Plyr | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'pip',
        'fullscreen',
      ],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
    })

    playerRef.current = player

    player.on('ready', () => {
      if (onReady) onReady(player)
    })

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime, player.duration)
      }
    }

    const handlePlay = () => {
      if (onPlay) onPlay()
    }

    const handlePause = () => {
      if (onPause) onPause()
    }

    const handleEnded = () => {
      if (onEnded) onEnded()
    }

    player.on('timeupdate', handleTimeUpdate)
    player.on('play', handlePlay)
    player.on('pause', handlePause)
    player.on('ended', handleEnded)

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [onReady, onTimeUpdate, onPlay, onPause, onEnded])

  // Update source when videoUrl changes
  useEffect(() => {
    if (playerRef.current && videoUrl) {
      playerRef.current.source = {
        type: 'video',
        sources: [
          {
            src: videoUrl,
            type: 'video/mp4',
          },
        ],
      }
    }
  }, [videoUrl])

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black shadow-[var(--shadow)]">
      <video
        ref={videoRef}
        className="plyr__video-embed w-full aspect-video"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  )
}
export default VideoPlayer
