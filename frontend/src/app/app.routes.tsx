import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProtectedRoute } from '../shared/components/guards/ProtectedRoute'
import { AdminRoute } from '../shared/components/guards/AdminRoute'
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import SignupPage from '../pages/public/SignupPage'
import CoursesPage from '../pages/public/CoursesPage'
import CourseDetailPage from '../pages/public/CourseDetailPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import DashboardPage from '../pages/student/DashboardPage'
import LearnPage from '../pages/student/LearnPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminCoursesPage from '../pages/admin/AdminCoursesPage'
import AdminCourseFormPage from '../pages/admin/AdminCourseFormPage'
import AdminStudentsPage from '../pages/admin/AdminStudentsPage'
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:slug', element: <CourseDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'learn/:slug/:lessonId', element: <LearnPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: 'admin', element: <AdminDashboardPage /> },
          { path: 'admin/courses', element: <AdminCoursesPage /> },
          { path: 'admin/courses/new', element: <AdminCourseFormPage /> },
          { path: 'admin/courses/:courseId/edit', element: <AdminCourseFormPage /> },
          { path: 'admin/students', element: <AdminStudentsPage /> },
          { path: 'admin/enrollments', element: <AdminEnrollmentsPage /> },
          { path: 'admin/analytics', element: <AdminAnalyticsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
