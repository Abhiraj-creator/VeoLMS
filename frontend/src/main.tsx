import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'
import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './app/app.routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
