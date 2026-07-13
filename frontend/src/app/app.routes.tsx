import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { AdminApp } from '../shared/components/guards/AdminApp'
import { ProtectedRoute } from '../shared/components/guards/ProtectedRoute'
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
  // ─── Public + Student routes (use public App shell with Navbar) ────────────
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ─── Admin routes (standalone shell — no public Navbar) ────────────────────
  {
    path: '/admin',
    element: <AdminApp />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'courses', element: <AdminCoursesPage /> },
      { path: 'courses/new', element: <AdminCourseFormPage /> },
      { path: 'courses/:courseId/edit', element: <AdminCourseFormPage /> },
      { path: 'students', element: <AdminStudentsPage /> },
      { path: 'enrollments', element: <AdminEnrollmentsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
    ],
  },
])
