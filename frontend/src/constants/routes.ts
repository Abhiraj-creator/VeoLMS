type RouteBuilder = (...segments: Array<string | number | undefined>) => string

const joinPath: RouteBuilder = (...segments) =>
  segments
    .filter((segment) => segment !== undefined && segment !== '')
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .join('/')
    .replace(/^/, '/')

export const ROUTES = {
  home: () => '/',
  login: (redirect?: string) =>
    redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login',
  signup: () => '/signup',
  courses: () => '/courses',
  courseDetails: (slug: string) => joinPath('courses', slug),
  dashboard: () => '/dashboard',
  learn: (slug: string, lessonId: string) => joinPath('learn', slug, lessonId),
  admin: () => '/admin',
  adminCourses: () => '/admin/courses',
  adminCourseNew: () => '/admin/courses/new',
  adminCourseEdit: (courseId: string) => joinPath('admin', 'courses', courseId, 'edit'),
  adminStudents: () => '/admin/students',
  adminEnrollments: () => '/admin/enrollments',
  adminAnalytics: () => '/admin/analytics',
} as const
