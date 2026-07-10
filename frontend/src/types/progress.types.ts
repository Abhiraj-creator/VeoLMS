export interface IProgress {
  _id: string
  student: string
  lesson: string
  course: string
  watchedSeconds: number
  totalSeconds: number
  completed: boolean
  lastWatchedAt: string
  updatedAt: string
}

export interface ICourseProgress {
  lessonId: string
  completed: boolean
  watchedSeconds: number
  totalSeconds: number
}
