import { useParams } from 'react-router-dom'
import { PageWrapper } from '../../shared/components/layout/PageWrapper'

export default function AdminCourseFormPage() {
  const { courseId } = useParams()

  return (
    <PageWrapper
      title="AdminCourseFormPage"
      subtitle={`Placeholder for ${courseId ? `editing course ${courseId}` : 'creating a new course'}.`}
    />
  )
}
