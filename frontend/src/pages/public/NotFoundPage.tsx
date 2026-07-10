import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { PageWrapper } from '../../shared/components/layout/PageWrapper'

export default function NotFoundPage() {
  return (
    <PageWrapper
      title="NotFoundPage"
      subtitle="The route does not exist, but the shell is still intact."
    >
      <Link
        to={ROUTES.home()}
        className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        Back home
      </Link>
    </PageWrapper>
  )
}
