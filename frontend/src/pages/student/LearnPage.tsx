import { useParams } from 'react-router-dom'
import { PageWrapper } from '../../shared/components/layout/PageWrapper'

export default function LearnPage() {
  const { slug, lessonId } = useParams()

  return (
    <PageWrapper
      title="LearnPage"
      subtitle={`Learning route scaffold for ${slug ?? 'unknown'} / ${lessonId ?? 'unknown'}.`}
    />
  )
}
