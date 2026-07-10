import { useParams } from 'react-router-dom'
import { PageWrapper } from '../../shared/components/layout/PageWrapper'

export default function CourseDetailPage() {
  const { slug } = useParams()

  return (
    <PageWrapper
      title="CourseDetailPage"
      subtitle={`Placeholder for course slug: ${slug ?? 'unknown'}.`}
    />
  )
}
