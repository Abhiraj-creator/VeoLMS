export type CourseCategory = 'Frontend' | 'Backend' | 'Fullstack' | 'Other'

export interface ILesson {
  _id: string
  sectionId: string
  title: string
  content: string
  duration: number
  order: number
  isPreview: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ISection {
  _id: string
  courseId: string
  title: string
  order: number
  isPublished: boolean
  lessons?: ILesson[]
  createdAt: string
  updatedAt: string
}

export interface ICourse {
  _id: string
  title: string
  slug: string
  category: CourseCategory
  shortDescription: string
  description: string
  thumbnailUrl: string | null
  thumbnailPublicId: string | null
  price: number
  totalDuration: number
  totalLessons: number
  tags: string[]
  isPublished: boolean
  createdBy: string | { _id: string; name: string }
  sections?: ISection[]
  createdAt: string
  updatedAt: string
}

export interface ICurriculum {
  sections: ISection[]
}
