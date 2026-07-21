import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'
import 'plyr/dist/plyr.css'
import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './app/app.routes'
import { ErrorBoundary } from './shared/components/guards/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
)

