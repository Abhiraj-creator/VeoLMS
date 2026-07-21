export interface IUser {
  _id: string
  name: string
  email: string
  role: 'student' | 'admin'
  avatar: string | null
  createdAt: string
  updatedAt?: string
  isActive?: boolean
  enrollmentCount?: number
}
